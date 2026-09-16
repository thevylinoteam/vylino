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

const MARKETING_PROVIDERS = [
  'ALL',
  'GOOGLE_ADS',
  'META_ADS',
  'ORGANIC',
  'SOCIAL',
  'OTHER',
] as const;
const MARKETING_PERIODS = [
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'MONTH_TO_DATE',
  'ALL_TIME',
  'DAILY',
  'CUSTOM',
] as const;
const MARKETING_SCOPES = ['ACCOUNT', 'CAMPAIGN'] as const;
const MAX_SNAPSHOTS_PER_REQUEST = 40;

type MarketingProvider = (typeof MARKETING_PROVIDERS)[number];
type MarketingPeriod = (typeof MARKETING_PERIODS)[number];
type MarketingScope = (typeof MARKETING_SCOPES)[number];

type MarketingSnapshotInput = {
  snapshotKey: string;
  provider: MarketingProvider;
  period: MarketingPeriod;
  scope: MarketingScope;
  periodStart?: string;
  periodEnd?: string;
  externalCampaignId?: string;
  campaignName?: string;
  currencyCode?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  qualifiedLeads?: number;
  customers?: number;
  revenue?: number;
  syncedAt?: string;
};

type MarketingSnapshotRequest = {
  version: '2026-09-16';
  snapshots: MarketingSnapshotInput[];
};

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type MarketingSnapshotNode = {
  id?: string;
  snapshotKey?: string;
};

type MarketingSnapshotConnection = {
  edges?: Array<{ node?: MarketingSnapshotNode }>;
};

type FindMarketingSnapshotResponse = {
  vylinoMarketingSnapshots?: MarketingSnapshotConnection;
};

type UpdateMarketingSnapshotResponse = {
  updateVylinoMarketingSnapshots?: MarketingSnapshotConnection;
};

type CreateMarketingSnapshotResponse = {
  createVylinoMarketingSnapshot?: MarketingSnapshotNode;
};

const safeSecretEquals = (supplied: string, expected: string) => {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

const finiteOrZero = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;

const optionalText = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const optionalIsoDateTime = (value: unknown) => {
  const text = optionalText(value);
  if (!text) return undefined;

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const isOneOf = <T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] => typeof value === 'string' && values.includes(value);

const expectedSnapshotKey = (snapshot: MarketingSnapshotInput) =>
  snapshot.scope === 'CAMPAIGN'
    ? `${snapshot.provider}:${snapshot.period}:CAMPAIGN:${snapshot.externalCampaignId}`
    : `${snapshot.provider}:${snapshot.period}:ACCOUNT`;

const isValidSnapshot = (snapshot: unknown): snapshot is MarketingSnapshotInput => {
  if (!snapshot || typeof snapshot !== 'object') return false;

  const value = snapshot as Partial<MarketingSnapshotInput>;

  if (
    typeof value.snapshotKey !== 'string' ||
    !value.snapshotKey.trim() ||
    !isOneOf(MARKETING_PROVIDERS, value.provider) ||
    !isOneOf(MARKETING_PERIODS, value.period) ||
    !isOneOf(MARKETING_SCOPES, value.scope)
  ) {
    return false;
  }

  if (value.scope === 'CAMPAIGN' && !optionalText(value.externalCampaignId)) {
    return false;
  }

  return value.snapshotKey.trim() === expectedSnapshotKey(value as MarketingSnapshotInput);
};

const isMarketingSnapshotRequest = (
  value: unknown,
): value is MarketingSnapshotRequest => {
  if (!value || typeof value !== 'object') return false;

  const request = value as Partial<MarketingSnapshotRequest>;

  return (
    request.version === '2026-09-16' &&
    Array.isArray(request.snapshots) &&
    request.snapshots.length <= MAX_SNAPSHOTS_PER_REQUEST &&
    request.snapshots.every(isValidSnapshot)
  );
};

class MarketingSnapshotTransport {
  constructor(
    private readonly graphqlUrl: string,
    private readonly apiKey: string,
  ) {}

  private async request<T>(query: string, variables: Record<string, unknown>) {
    const response = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = (await response.json()) as GraphQlResponse<T>;

    if (!response.ok || payload.errors?.length) {
      const message = payload.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join('; ');

      throw new Error(
        message || `Twenty GraphQL request failed with ${response.status}`,
      );
    }

    if (!payload.data) {
      throw new Error('Twenty GraphQL response did not include data');
    }

    return payload.data;
  }

  private normalize(snapshot: MarketingSnapshotInput) {
    const spend = finiteOrZero(snapshot.spend);
    const impressions = finiteOrZero(snapshot.impressions);
    const clicks = finiteOrZero(snapshot.clicks);
    const leads = finiteOrZero(snapshot.leads);
    const qualifiedLeads = finiteOrZero(snapshot.qualifiedLeads);
    const customers = finiteOrZero(snapshot.customers);
    const revenue = finiteOrZero(snapshot.revenue);

    return {
      snapshotKey: expectedSnapshotKey(snapshot),
      provider: snapshot.provider,
      period: snapshot.period,
      scope: snapshot.scope,
      periodStart: optionalIsoDateTime(snapshot.periodStart),
      periodEnd: optionalIsoDateTime(snapshot.periodEnd),
      externalCampaignId: optionalText(snapshot.externalCampaignId),
      campaignName: optionalText(snapshot.campaignName),
      currencyCode: optionalText(snapshot.currencyCode)?.toUpperCase(),
      spend,
      impressions,
      clicks,
      leads,
      qualifiedLeads,
      customers,
      revenue,
      cpl: leads > 0 ? spend / leads : 0,
      cac: customers > 0 ? spend / customers : 0,
      roas: spend > 0 ? revenue / spend : 0,
      ctr: impressions > 0 ? clicks / impressions : 0,
      leadToCustomerRate: leads > 0 ? customers / leads : 0,
      syncedAt: optionalIsoDateTime(snapshot.syncedAt) ?? new Date().toISOString(),
    };
  }

  async upsert(snapshot: MarketingSnapshotInput) {
    const normalized = this.normalize(snapshot);
    const existing = await this.request<FindMarketingSnapshotResponse>(
      `query FindVylinoMarketingSnapshot($snapshotKey: String!) {
        vylinoMarketingSnapshots(
          filter: { snapshotKey: { eq: $snapshotKey } }
          first: 1
        ) {
          edges { node { id snapshotKey } }
        }
      }`,
      { snapshotKey: normalized.snapshotKey },
    );

    const existingId = existing.vylinoMarketingSnapshots?.edges?.[0]?.node?.id;

    if (existingId) {
      await this.request<UpdateMarketingSnapshotResponse>(
        `mutation UpdateVylinoMarketingSnapshot($id: UUID!, $data: VylinoMarketingSnapshotUpdateInput!) {
          updateVylinoMarketingSnapshots(
            filter: { id: { eq: $id } }
            data: $data
          ) {
            edges { node { id snapshotKey } }
          }
        }`,
        { id: existingId, data: normalized },
      );

      return { id: existingId, created: false };
    }

    const created = await this.request<CreateMarketingSnapshotResponse>(
      `mutation CreateVylinoMarketingSnapshot($data: VylinoMarketingSnapshotCreateInput!) {
        createVylinoMarketingSnapshot(data: $data) { id snapshotKey }
      }`,
      { data: normalized },
    );

    const id = created.createVylinoMarketingSnapshot?.id;

    if (!id) {
      throw new Error('Twenty createVylinoMarketingSnapshot did not return an id');
    }

    return { id, created: true };
  }
}

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

    if (!isMarketingSnapshotRequest(body)) {
      return response.status(400).json({
        ok: false,
        error: 'invalid_payload',
        maxSnapshots: MAX_SNAPSHOTS_PER_REQUEST,
      });
    }

    const transport = new MarketingSnapshotTransport(graphqlUrl, apiKey);

    try {
      let created = 0;
      let updated = 0;

      for (const snapshot of body.snapshots) {
        const result = await transport.upsert(snapshot);

        if (result.created) created += 1;
        else updated += 1;
      }

      return response.status(200).json({
        ok: true,
        processed: body.snapshots.length,
        created,
        updated,
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
