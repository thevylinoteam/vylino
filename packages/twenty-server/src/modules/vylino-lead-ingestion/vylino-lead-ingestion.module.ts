import { Module } from '@nestjs/common';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

import { VylinoLeadIngestionController } from './vylino-lead-ingestion.controller';
import { VylinoMarketingSnapshotController } from './vylino-marketing-snapshot.controller';

@Module({
  imports: [RedisClientModule],
  controllers: [
    VylinoLeadIngestionController,
    VylinoMarketingSnapshotController,
  ],
})
export class VylinoLeadIngestionModule {}
