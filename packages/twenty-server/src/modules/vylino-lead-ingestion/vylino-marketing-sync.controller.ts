import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { VylinoMarketingSyncStateService } from './vylino-marketing-sync-state.service';
import { VylinoMarketingSyncService } from './vylino-marketing-sync.service';

const safeSecretEquals = (supplied: string, expected: string) => {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

@Controller(`${ApiPath.Rest}/vylino/marketing/sync`)
export class VylinoMarketingSyncController {
  constructor(
    private readonly syncService: VylinoMarketingSyncService,
    private readonly state: VylinoMarketingSyncStateService,
  ) {}

  private authorize(request: Request) {
    const expected =
      process.env.VYLINO_MARKETING_SYNC_SHARED_SECRET?.trim() ??
      process.env.VYLINO_MARKETING_INGEST_SHARED_SECRET?.trim() ??
      process.env.VYLINO_INGEST_SHARED_SECRET?.trim();
    const supplied = request.header('x-vylino-sync-key');

    return Boolean(
      expected && supplied && safeSecretEquals(supplied, expected),
    );
  }

  @Post('run')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async run(@Req() request: Request, @Res() response: Response) {
    if (!this.authorize(request)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    try {
      const result = await this.syncService.run('manual');
      return response.status(200).json(result);
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'marketing_sync_failed',
        message:
          error instanceof Error ? error.message : 'Marketing sync failed',
      });
    }
  }

  @Post('status')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async status(@Req() request: Request, @Res() response: Response) {
    if (!this.authorize(request)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    return response.status(200).json({
      ok: true,
      enabled: this.syncService.isEnabled(),
      sync: await this.state.getStatus(),
    });
  }
}
