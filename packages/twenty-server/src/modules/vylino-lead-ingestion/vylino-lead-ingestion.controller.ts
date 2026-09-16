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

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { VylinoGraphqlCrmTransport } from './vylino-graphql-crm.transport';
import { VylinoLeadIdempotencyStore } from './vylino-lead-ingestion.idempotency';
import { ingestVylinoLead } from './vylino-lead-ingestion.service';
import type { WordPressLeadWebhookRequest } from './vylino-lead-ingestion.types';

const safeSecretEquals = (supplied: string, expected: string) => {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

const isWordPressLeadWebhookRequest = (
  value: unknown,
): value is WordPressLeadWebhookRequest => {
  if (!value || typeof value !== 'object') return false;

  const request = value as Partial<WordPressLeadWebhookRequest>;

  return (
    request.event === 'lead.submitted' &&
    request.version === '2026-09-16' &&
    typeof request.sentAt === 'string' &&
    typeof request.idempotencyKey === 'string' &&
    Boolean(request.payload?.lead)
  );
};

@Controller(`${ApiPath.Rest}/vylino/leads`)
export class VylinoLeadIngestionController {
  constructor(private readonly redisClientService: RedisClientService) {}

  @Post('ingest')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async ingest(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: unknown,
  ) {
    const sharedSecret = process.env.VYLINO_INGEST_SHARED_SECRET;
    const graphqlUrl = process.env.VYLINO_TWENTY_GRAPHQL_URL;
    const apiKey = process.env.VYLINO_TWENTY_API_KEY;

    if (!sharedSecret || !graphqlUrl || !apiKey) {
      return response.status(503).json({
        ok: false,
        error: 'vylino_ingestion_not_configured',
      });
    }

    const suppliedSecret = request.header('x-vylino-ingest-key');

    if (!suppliedSecret || !safeSecretEquals(suppliedSecret, sharedSecret)) {
      return response.status(401).json({
        ok: false,
        error: 'unauthorized',
      });
    }

    if (!isWordPressLeadWebhookRequest(body)) {
      return response.status(400).json({
        ok: false,
        error: 'invalid_payload',
      });
    }

    const redis = this.redisClientService.getClient();
    const idempotencyStore = new VylinoLeadIdempotencyStore(redis);
    const crm = new VylinoGraphqlCrmTransport(graphqlUrl, apiKey);

    try {
      const result = await ingestVylinoLead({
        request: body,
        crm,
        idempotencyStore,
        options: {
          createOpportunity:
            process.env.VYLINO_CREATE_OPPORTUNITY?.toLowerCase() !== 'false',
          opportunityStage:
            process.env.VYLINO_DEFAULT_OPPORTUNITY_STAGE ?? 'NEW_LEAD',
          opportunityCurrencyCode:
            process.env.VYLINO_DEFAULT_CURRENCY_CODE ?? 'INR',
          companyName: process.env.VYLINO_DEFAULT_COMPANY_NAME,
          writeAttributionFields:
            process.env.VYLINO_WRITE_ATTRIBUTION_FIELDS?.toLowerCase() ===
            'true',
        },
      });

      return response.status(200).json({
        ok: true,
        duplicate: result.status === 'duplicate',
        idempotencyKey: result.idempotencyKey,
        persistence: result.persistence,
      });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'lead_ingestion_failed',
        message:
          error instanceof Error ? error.message : 'Lead ingestion failed',
        idempotencyKey: body.idempotencyKey,
      });
    }
  }
}
