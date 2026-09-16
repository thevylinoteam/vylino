export const VYLINO_MARKETING_PROVIDERS = [
  'ALL',
  'GOOGLE_ADS',
  'META_ADS',
  'ORGANIC',
  'SOCIAL',
  'OTHER',
] as const;

export const VYLINO_MARKETING_PERIODS = [
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'MONTH_TO_DATE',
  'ALL_TIME',
  'DAILY',
  'CUSTOM',
] as const;

export const VYLINO_MARKETING_SCOPES = ['ACCOUNT', 'CAMPAIGN'] as const;
export const VYLINO_MAX_SNAPSHOTS_PER_REQUEST = 40;

export type VylinoMarketingProvider =
  (typeof VYLINO_MARKETING_PROVIDERS)[number];
export type VylinoMarketingPeriod = (typeof VYLINO_MARKETING_PERIODS)[number];
export type VylinoMarketingScope = (typeof VYLINO_MARKETING_SCOPES)[number];

export type VylinoMarketingSnapshotInput = {
  snapshotKey: string;
  provider: VylinoMarketingProvider;
  period: VylinoMarketingPeriod;
  scope: VylinoMarketingScope;
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

export type VylinoMarketingSnapshotRequest = {
  version: '2026-09-16';
  snapshots: VylinoMarketingSnapshotInput[];
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

export const expectedVylinoMarketingSnapshotKey = (
  snapshot: VylinoMarketingSnapshotInput,
) =>
  snapshot.scope === 'CAMPAIGN'
    ? `${snapshot.provider}:${snapshot.period}:CAMPAIGN:${snapshot.externalCampaignId}`
    : `${snapshot.provider}:${snapshot.period}:ACCOUNT`;

export const isValidVylinoMarketingSnapshot = (
  snapshot: unknown,
): snapshot is VylinoMarketingSnapshotInput => {
  if (!snapshot || typeof snapshot !== 'object') return false;

  const value = snapshot as Partial<VylinoMarketingSnapshotInput>;

  if (
    typeof value.snapshotKey !== 'string' ||
    !value.snapshotKey.trim() ||
    !isOneOf(VYLINO_MARKETING_PROVIDERS, value.provider) ||
    !isOneOf(VYLINO_MARKETING_PERIODS, value.period) ||
    !isOneOf(VYLINO_MARKETING_SCOPES, value.scope)
  ) {
    return false;
  }

  if (value.scope === 'CAMPAIGN' && !optionalText(value.externalCampaignId)) {
    return false;
  }

  return (
    value.snapshotKey.trim() ===
    expectedVylinoMarketingSnapshotKey(value as VylinoMarketingSnapshotInput)
  );
};

export const isVylinoMarketingSnapshotRequest = (
  value: unknown,
): value is VylinoMarketingSnapshotRequest => {
  if (!value || typeof value !== 'object') return false;

  const request = value as Partial<VylinoMarketingSnapshotRequest>;

  return (
    request.version === '2026-09-16' &&
    Array.isArray(request.snapshots) &&
    request.snapshots.length <= VYLINO_MAX_SNAPSHOTS_PER_REQUEST &&
    request.snapshots.every(isValidVylinoMarketingSnapshot)
  );
};

export class VylinoMarketingSnapshotTransport {
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
      signal: AbortSignal.timeout(30_000),
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

  private normalize(snapshot: VylinoMarketingSnapshotInput) {
    const spend = finiteOrZero(snapshot.spend);
    const impressions = finiteOrZero(snapshot.impressions);
    const clicks = finiteOrZero(snapshot.clicks);
    const leads = finiteOrZero(snapshot.leads);
    const qualifiedLeads = finiteOrZero(snapshot.qualifiedLeads);
    const customers = finiteOrZero(snapshot.customers);
    const revenue = finiteOrZero(snapshot.revenue);

    return {
      snapshotKey: expectedVylinoMarketingSnapshotKey(snapshot),
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
      syncedAt:
        optionalIsoDateTime(snapshot.syncedAt) ?? new Date().toISOString(),
    };
  }

  async upsert(snapshot: VylinoMarketingSnapshotInput) {
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
      throw new Error(
        'Twenty createVylinoMarketingSnapshot did not return an id',
      );
    }

    return { id, created: true };
  }

  async upsertMany(snapshots: VylinoMarketingSnapshotInput[]) {
    let created = 0;
    let updated = 0;

    for (const snapshot of snapshots) {
      const result = await this.upsert(snapshot);

      if (result.created) created += 1;
      else updated += 1;
    }

    return {
      processed: snapshots.length,
      created,
      updated,
    };
  }
}
