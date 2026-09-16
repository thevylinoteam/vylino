import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

import { RedisLeadIngestionIdempotencyStore } from '../../../../vylino-integrations/src/lead-ingestion/redis-idempotency-store';
import { handleVylinoLeadIngestionHttpRequest } from '../../../../vylino-integrations/src/server/lead-ingestion-endpoint';
import type { WordPressLeadWebhookRequest } from '../../../../vylino-integrations/src/wordpress/webhook-contract';
import { VylinoGraphqlCrmTransport } from './vylino-graphql-crm.transport';

@Controller(`${ApiPath.Rest}/vylino/leads`)
export class VylinoLeadIngestionController {
  constructor(private readonly redisClientService: RedisClientService) {}

  @Post('ingest')
  @HttpCode(200)
  async ingest(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: WordPressLeadWebhookRequest,
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

    const redis = this.redisClientService.getClient();
    const idempotencyStore = new RedisLeadIngestionIdempotencyStore(redis);
    const crm = new VylinoGraphqlCrmTransport(graphqlUrl, apiKey);

    const result = await handleVylinoLeadIngestionHttpRequest(
      { crm, idempotencyStore },
      {
        sharedSecret,
        workspaceId: process.env.VYLINO_WORKSPACE_ID,
        createOpportunity:
          process.env.VYLINO_CREATE_OPPORTUNITY?.toLowerCase() !== 'false',
        opportunityStage: process.env.VYLINO_DEFAULT_OPPORTUNITY_STAGE ?? 'NEW',
        opportunityCurrencyCode:
          process.env.VYLINO_DEFAULT_CURRENCY_CODE ?? 'INR',
      },
      {
        method: request.method,
        headers: request.headers as Record<string, string | string[] | undefined>,
        body,
      },
    );

    return response.status(result.status).json(result.body);
  }
}
