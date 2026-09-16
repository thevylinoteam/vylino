import { Injectable } from '@nestjs/common';

import { VylinoPaidMarketingExecutorService } from './vylino-paid-marketing-executor.service';
import {
  VylinoMarketingSyncStateService,
  type VylinoMarketingSyncTrigger,
} from './vylino-marketing-sync-state.service';

@Injectable()
export class VylinoMarketingSyncService {
  constructor(
    private readonly state: VylinoMarketingSyncStateService,
    private readonly executor: VylinoPaidMarketingExecutorService,
  ) {}

  isEnabled() {
    return process.env.VYLINO_MARKETING_SYNC_ENABLED?.toLowerCase() === 'true';
  }

  async run(trigger: VylinoMarketingSyncTrigger) {
    if (!this.isEnabled()) {
      await this.state.markSkipped(trigger, 'marketing_sync_disabled');

      return { ok: true, skipped: true, reason: 'marketing_sync_disabled' };
    }

    if (!this.executor.isConfigured()) {
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
      const result = await this.executor.execute();
      const completedAt = new Date().toISOString();

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

      return {
        ...result,
        skipped: false,
      };
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
