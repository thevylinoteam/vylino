import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

import { VylinoLeadIngestionController } from './vylino-lead-ingestion.controller';
import { VylinoMarketingSnapshotController } from './vylino-marketing-snapshot.controller';
import { VylinoMarketingSyncController } from './vylino-marketing-sync.controller';
import { VylinoMarketingSyncScheduler } from './vylino-marketing-sync.scheduler';
import { VylinoMarketingSyncStateService } from './vylino-marketing-sync-state.service';
import { VylinoMarketingSyncService } from './vylino-marketing-sync.service';
import { VylinoPaidMarketingExecutorService } from './vylino-paid-marketing-executor.service';

@Module({
  imports: [RedisClientModule, ScheduleModule.forRoot()],
  controllers: [
    VylinoLeadIngestionController,
    VylinoMarketingSnapshotController,
    VylinoMarketingSyncController,
  ],
  providers: [
    VylinoPaidMarketingExecutorService,
    VylinoMarketingSyncStateService,
    VylinoMarketingSyncService,
    VylinoMarketingSyncScheduler,
  ],
})
export class VylinoLeadIngestionModule {}
