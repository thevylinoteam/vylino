import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { VylinoMarketingSyncService } from './vylino-marketing-sync.service';

const ONE_HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class VylinoMarketingSyncScheduler {
  private readonly logger = new Logger(VylinoMarketingSyncScheduler.name);

  constructor(private readonly syncService: VylinoMarketingSyncService) {}

  @Interval('vylino-paid-marketing-sync', ONE_HOUR_MS)
  async runScheduledSync() {
    if (!this.syncService.isEnabled()) return;

    try {
      const result = await this.syncService.run('scheduled');

      if (
        result.skipped ||
        !('processedRecords' in result) ||
        !('processedSnapshots' in result)
      ) {
        this.logger.log(`Scheduled marketing sync skipped: ${result.reason}`);
        return;
      }

      this.logger.log(
        `Scheduled marketing sync completed: ${result.processedRecords} records, ${result.processedSnapshots} snapshots`,
      );
    } catch (error) {
      this.logger.error(
        `Scheduled marketing sync failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
