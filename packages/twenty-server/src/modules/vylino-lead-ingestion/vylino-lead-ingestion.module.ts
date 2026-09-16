import { Module } from '@nestjs/common';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

import { VylinoLeadIngestionController } from './vylino-lead-ingestion.controller';

@Module({
  imports: [RedisClientModule],
  controllers: [VylinoLeadIngestionController],
})
export class VylinoLeadIngestionModule {}
