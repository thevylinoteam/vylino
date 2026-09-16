import {
  Body,
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

import {
  VYLINO_MAX_SNAPSHOTS_PER_REQUEST,
  VylinoMarketingSnapshotTransport,
  isVylinoMarketingSnapshotRequest,
} from './vylino-marketing-snapshot.transport';

const safeSecretEquals = (supplied: string, expected: string) => {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

@Controller(`${ApiPath.Rest}/vylino/marketing`)
export class VylinoMarketingSnapshotController {
  @Post('snapshots')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async ingest(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: unknown,
  ) {
    const sharedSecret =
      process.env.VYLINO_MARKETING_INGEST_SHARED_SECRET ??
      process.env.VYLINO_INGEST_SHARED_SECRET;
    const graphqlUrl = process.env.VYLINO_TWENTY_GRAPHQL_URL;
    const apiKey = process.env.VYLINO_TWENTY_API_KEY;

    if (!sharedSecret || !graphqlUrl || !apiKey) {
      return response.status(503).json({
        ok: false,
        error: 'vylino_marketing_ingestion_not_configured',
      });
    }

    const suppliedSecret = request.header('x-vylino-ingest-key');

    if (!suppliedSecret || !safeSecretEquals(suppliedSecret, sharedSecret)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    if (!isVylinoMarketingSnapshotRequest(body)) {
      return response.status(400).json({
        ok: false,
        error: 'invalid_payload',
        maxSnapshots: VYLINO_MAX_SNAPSHOTS_PER_REQUEST,
      });
    }

    const transport = new VylinoMarketingSnapshotTransport(graphqlUrl, apiKey);

    try {
      const result = await transport.upsertMany(body.snapshots);

      return response.status(200).json({
        ok: true,
        ...result,
      });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'marketing_snapshot_ingestion_failed',
        message:
          error instanceof Error ? error.message : 'Marketing ingestion failed',
      });
    }
  }
}
