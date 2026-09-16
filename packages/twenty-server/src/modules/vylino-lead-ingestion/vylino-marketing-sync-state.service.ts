import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

const LOCK_KEY = 'vylino:marketing-sync:lock';
const STATUS_KEY = 'vylino:marketing-sync:status';
const LOCK_TTL_MS = 20 * 60 * 1000;
const STATUS_TTL_SECONDS = 60 * 60 * 24 * 30;

export type VylinoMarketingSyncTrigger = 'scheduled' | 'manual';
export type VylinoMarketingSyncStatusName =
  | 'idle'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'skipped';

export type VylinoMarketingSyncStatus = {
  status: VylinoMarketingSyncStatusName;
  trigger?: VylinoMarketingSyncTrigger;
  startedAt?: string;
  completedAt?: string;
  lastSuccessfulSyncAt?: string;
  durationMs?: number;
  processedRecords?: number;
  processedSnapshots?: number;
  createdSnapshots?: number;
  updatedSnapshots?: number;
  error?: string;
  reason?: string;
};

@Injectable()
export class VylinoMarketingSyncStateService {
  constructor(private readonly redisClientService: RedisClientService) {}

  async acquireLock() {
    const redis = this.redisClientService.getClient();
    const token = randomUUID();
    const acquired = await redis.set(LOCK_KEY, token, 'PX', LOCK_TTL_MS, 'NX');

    return acquired === 'OK' ? token : null;
  }

  async releaseLock(token: string) {
    const redis = this.redisClientService.getClient();

    await redis.eval(
      `if redis.call('get', KEYS[1]) == ARGV[1] then
         return redis.call('del', KEYS[1])
       end
       return 0`,
      1,
      LOCK_KEY,
      token,
    );
  }

  async getStatus(): Promise<VylinoMarketingSyncStatus> {
    const value = await this.redisClientService.getClient().get(STATUS_KEY);

    if (!value) return { status: 'idle' };

    try {
      return JSON.parse(value) as VylinoMarketingSyncStatus;
    } catch {
      return { status: 'idle' };
    }
  }

  async setStatus(status: VylinoMarketingSyncStatus) {
    await this.redisClientService
      .getClient()
      .set(STATUS_KEY, JSON.stringify(status), 'EX', STATUS_TTL_SECONDS);
  }

  async markRunning(trigger: VylinoMarketingSyncTrigger, startedAt: string) {
    const previous = await this.getStatus();

    await this.setStatus({
      status: 'running',
      trigger,
      startedAt,
      lastSuccessfulSyncAt: previous.lastSuccessfulSyncAt,
    });
  }

  async markSucceeded(input: {
    trigger: VylinoMarketingSyncTrigger;
    startedAt: string;
    completedAt: string;
    durationMs: number;
    processedRecords: number;
    processedSnapshots: number;
    createdSnapshots: number;
    updatedSnapshots: number;
  }) {
    await this.setStatus({
      status: 'succeeded',
      trigger: input.trigger,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      lastSuccessfulSyncAt: input.completedAt,
      durationMs: input.durationMs,
      processedRecords: input.processedRecords,
      processedSnapshots: input.processedSnapshots,
      createdSnapshots: input.createdSnapshots,
      updatedSnapshots: input.updatedSnapshots,
    });
  }

  async markFailed(input: {
    trigger: VylinoMarketingSyncTrigger;
    startedAt: string;
    completedAt: string;
    durationMs: number;
    error: string;
  }) {
    const previous = await this.getStatus();

    await this.setStatus({
      status: 'failed',
      trigger: input.trigger,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      lastSuccessfulSyncAt: previous.lastSuccessfulSyncAt,
      durationMs: input.durationMs,
      error: input.error,
    });
  }

  async markSkipped(trigger: VylinoMarketingSyncTrigger, reason: string) {
    const previous = await this.getStatus();

    await this.setStatus({
      ...previous,
      status: 'skipped',
      trigger,
      completedAt: new Date().toISOString(),
      reason,
    });
  }
}
