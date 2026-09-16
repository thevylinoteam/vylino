import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { VylinoWhatsAppCatalogService } from './vylino-whatsapp-catalog.service';

@Controller(`${ApiPath.Rest}/vylino/whatsapp/catalog`)
export class VylinoWhatsAppCatalogController {
  constructor(private readonly catalog: VylinoWhatsAppCatalogService) {}

  @Post('seed')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async seed(@Req() request: Request, @Res() response: Response) {
    const expected = process.env.VYLINO_WHATSAPP_SHARED_SECRET;
    const supplied = request.header('x-vylino-whatsapp-key');
    if (!expected || !supplied) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const a = Buffer.from(expected);
    const b = Buffer.from(supplied);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    try {
      const result = await this.catalog.seedDefaults();
      return response.status(200).json({ ok: true, ...result });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'catalog_seed_failed',
        message: error instanceof Error ? error.message : 'Catalog seed failed',
      });
    }
  }
}
