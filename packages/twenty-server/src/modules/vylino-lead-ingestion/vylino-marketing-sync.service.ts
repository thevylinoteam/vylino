import { Injectable } from '@nestjs/common';

import {
  VylinoMarketingSyncStateService,
  type VylinoMarketingSyncTrigger,
} from './vylino-marketing-sync-state.service';

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

type SyncExecutorResponse = {
  ok?: boolean;
  processedRecords?: number;
  processedSnapshots?: number;
  createdSnapshots?: number;
  updatedSnapshots?: number;
  error?: string;
  message?: string;
};

const finiteCount = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

@Injectable()
export class VylinoMarketingSyncService {
  constructor(private readonly state: VylinoMarketingSyncStateService) {}

  isEnabled() {
    return process.env.VYLINO_MARKETING_SYNC_ENABLED?.toLowerCase() === 'true';
  }

  async run(trigger: VylinoMarketingSyncTrigger) {
    if (!this.isEnabled()) {
      await this.state.markSkipped(trigger, 'marketing_sync_disabled');

      return { ok: true, skipped: true, reason: 'marketing_sync_disabled' };
    }

    const executorUrl = process.env.VYLINO_MARKETING_SYNC_EXECUTOR_URL?.trim();
    const sharedSecret =
      process.env.VYLINO_MARKETING_SYNC_SHARED_SECRET?.trim() ??
      process.env.VYLINO_MARKETING_INGEST_SHARED_SECRET?.trim() ??
      process.env.VYLINO_INGEST_SHARED_SECRET?.trim();

    if (!executorUrl || !sharedSecret) {
      await this.state.markSkipped(trigger, 'marketing_sync_not_configured');

      return {
        ok: false,
        skipped: true,
        reason: 'marketing_sync_not_configured',
      };
    }

    const lockToken = await this.state.acquireLock();

    if (!lockToken) {
      await this.state.markSkipped(trigger, 'marketing_sync_already_running');

      return {
        ok: true,
        skipped: true,
        reason: 'marketing_sync_already_running',
      };
    }

    const startedAt = new Date().toISOString();
    const started = Date.now();

    await this.state.markRunning(trigger, startedAt);

    try {
      const response = await fetch(executorUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-vylino-sync-key': sharedSecret,
        },
        body: JSON.stringify({
          version: '2026-09-16',
          trigger,
          period: 'LAST_30_DAYS',
          requestedAt: startedAt,
        }),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
      const payload = (await response.json()) as SyncExecutorResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.message ??
            payload.error ??
            `Marketing sync executor failed with ${response.status}`,
        );
      }

      const completedAt = new Date().toISOString();
      const result = {
        ok: true,
        skipped: false,
        processedRecords: finiteCount(payload.processedRecords),
        processedSnapshots: finiteCount(payload.processedSnapshots),
        createdSnapshots: finiteCount(payload.createdSnapshots),
        updatedSnapshots: finiteCount(payload.updatedSnapshots),
      };

      await this.state.markSucceeded({
        trigger,
        startedAt,
        completedAt,
        durationMs: Date.now() - started,
        processedRecords: result.processedRecords,
        processedSnapshots: result.processedSnapshots,
        createdSnapshots: result.createdSnapshots,
        updatedSnapshots: result.updatedSnapshots,
      });

      return result;
    } catch (error) {
      const completedAt = new Date().toISOString();
      const message =
        error instanceof Error ? error.message : 'Marketing sync failed';

      await this.state.markFailed({
        trigger,
        startedAt,
        completedAt,
        durationMs: Date.now() - started,
        error: message,
      });

      throw error;
    } finally {
      await this.state.releaseLock(lockToken);
    }
  }
}
