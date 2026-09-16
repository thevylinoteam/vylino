import { Injectable } from '@nestjs/common';

import { createHmac } from 'crypto';

import {
  type VylinoMarketingSnapshotInput,
  VylinoMarketingSnapshotTransport,
} from './vylino-marketing-snapshot.transport';

const GOOGLE_OAUTH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token';
const DEFAULT_GOOGLE_ADS_API_VERSION = 'v25';
const DEFAULT_META_GRAPH_API_VERSION = 'v26.0';
const REQUEST_TIMEOUT_MS = 30_000;

type DateRange = { startDate: string; endDate: string };
type ProviderName = 'GOOGLE_ADS' | 'META_ADS';

type MetricRecord = {
  provider: ProviderName;
  campaignId: string;
  campaignName: string;
  currencyCode?: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  customers: number;
  revenue: number;
};

type ProviderSyncResult = {
  provider: ProviderName;
  configured: boolean;
  records: MetricRecord[];
  currencyCode?: string;
};

type GoogleOAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GoogleAdsRow = {
  customer?: {
    id?: string;
    currencyCode?: string;
  };
  campaign?: {
    id?: string;
    name?: string;
  };
  metrics?: {
    impressions?: string | number;
    clicks?: string | number;
    costMicros?: string | number;
    conversions?: string | number;
    conversionsValue?: string | number;
  };
};

type GoogleAdsSearchResponse = {
  results?: GoogleAdsRow[];
  nextPageToken?: string;
  error?: { message?: string };
};

type MetaAction = { action_type: string; value: string };
type MetaGraphError = { message?: string };

type MetaAccount = {
  id?: string;
  account_id?: string;
  currency?: string;
  error?: MetaGraphError;
};

type MetaCampaign = {
  id?: string;
  name?: string;
};

type MetaInsight = {
  campaign_id?: string;
  date_start?: string;
  impressions?: string | number;
  clicks?: string | number;
  spend?: string | number;
  actions?: MetaAction[];
  action_values?: MetaAction[];
};

type MetaPage<T> = {
  data?: T[];
  paging?: {
    cursors?: { after?: string };
    next?: string;
  };
  error?: MetaGraphError;
};

const optionalEnv = (key: string) => process.env[key]?.trim() || undefined;

const requiredEnv = (key: string) => {
  const value = optionalEnv(key);
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const toNumber = (value: string | number | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const rollingThirtyDays = (): DateRange => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

const firstMetaActionValue = (
  actions: MetaAction[] | undefined,
  aliases: string[],
) => {
  for (const alias of aliases) {
    const match = actions?.find((action) => action.action_type === alias);
    if (match) return toNumber(match.value);
  }
  return 0;
};

const aggregateMetrics = (records: MetricRecord[]) =>
  records.reduce(
    (totals, record) => ({
      spend: totals.spend + record.spend,
      impressions: totals.impressions + record.impressions,
      clicks: totals.clicks + record.clicks,
      leads: totals.leads + record.leads,
      customers: totals.customers + record.customers,
      revenue: totals.revenue + record.revenue,
    }),
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      customers: 0,
      revenue: 0,
    },
  );

const rangeAsIso = (range: DateRange) => ({
  periodStart: `${range.startDate}T00:00:00.000Z`,
  periodEnd: `${range.endDate}T23:59:59.999Z`,
});

const groupCampaigns = (records: MetricRecord[]) => {
  const grouped = new Map<string, MetricRecord[]>();

  for (const record of records) {
    const existing = grouped.get(record.campaignId) ?? [];
    existing.push(record);
    grouped.set(record.campaignId, existing);
  }

  return grouped;
};

@Injectable()
export class VylinoPaidMarketingExecutorService {
  private googleAccessToken?: { value: string; expiresAt: number };

  isConfigured() {
    return Boolean(
      optionalEnv('VYLINO_TWENTY_GRAPHQL_URL') &&
      optionalEnv('VYLINO_TWENTY_API_KEY') &&
      (this.isGoogleConfigured() || this.isMetaConfigured()),
    );
  }

  private isGoogleConfigured() {
    return Boolean(
      optionalEnv('GOOGLE_ADS_CUSTOMER_ID') &&
      optionalEnv('GOOGLE_ADS_CLIENT_ID') &&
      optionalEnv('GOOGLE_ADS_CLIENT_SECRET') &&
      optionalEnv('GOOGLE_ADS_REFRESH_TOKEN'),
    );
  }

  private isMetaConfigured() {
    return Boolean(
      optionalEnv('META_ACCESS_TOKEN') && optionalEnv('META_AD_ACCOUNT_ID'),
    );
  }

  private async getGoogleAccessToken() {
    const now = Date.now();
    if (
      this.googleAccessToken &&
      this.googleAccessToken.expiresAt - 60_000 > now
    ) {
      return this.googleAccessToken.value;
    }

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: requiredEnv('GOOGLE_ADS_CLIENT_ID'),
        client_secret: requiredEnv('GOOGLE_ADS_CLIENT_SECRET'),
        refresh_token: requiredEnv('GOOGLE_ADS_REFRESH_TOKEN'),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const payload = (await response.json()) as GoogleOAuthTokenResponse;

    if (!response.ok || !payload.access_token) {
      throw new Error(
        payload.error_description ??
          payload.error ??
          `Google OAuth token request failed with ${response.status}`,
      );
    }

    this.googleAccessToken = {
      value: payload.access_token,
      expiresAt: now + Math.max(60, payload.expires_in ?? 3600) * 1000,
    };

    return this.googleAccessToken.value;
  }

  private async googleSearch(customerId: string, query: string) {
    const apiVersion =
      optionalEnv('GOOGLE_ADS_API_VERSION') ?? DEFAULT_GOOGLE_ADS_API_VERSION;
    if (!/^v\d+$/.test(apiVersion)) {
      throw new Error('GOOGLE_ADS_API_VERSION must use the form vNN.');
    }

    const rows: GoogleAdsRow[] = [];
    let pageToken: string | undefined;

    do {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        authorization: `Bearer ${await this.getGoogleAccessToken()}`,
      };
      const developerToken = optionalEnv('GOOGLE_ADS_DEVELOPER_TOKEN');
      const loginCustomerId = optionalEnv('GOOGLE_ADS_LOGIN_CUSTOMER_ID');
      if (developerToken) headers['developer-token'] = developerToken;
      if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
      }

      const response = await fetch(
        `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            ...(pageToken ? { pageToken } : {}),
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
      const payload = (await response.json()) as GoogleAdsSearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(
          payload.error?.message ??
            `Google Ads search failed with ${response.status}`,
        );
      }

      rows.push(...(payload.results ?? []));
      pageToken = payload.nextPageToken;
    } while (pageToken);

    return rows;
  }

  private async syncGoogle(range: DateRange): Promise<ProviderSyncResult> {
    if (!this.isGoogleConfigured()) {
      return { provider: 'GOOGLE_ADS', configured: false, records: [] };
    }

    const customerId = requiredEnv('GOOGLE_ADS_CUSTOMER_ID').replace(/-/g, '');
    const accountRows = await this.googleSearch(
      customerId,
      `SELECT customer.id, customer.currency_code FROM customer`,
    );
    const currencyCode = accountRows[0]?.customer?.currencyCode?.toUpperCase();
    const rows = await this.googleSearch(
      customerId,
      `SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE campaign.status != 'REMOVED' AND segments.date BETWEEN '${range.startDate}' AND '${range.endDate}'`,
    );

    const records = rows.flatMap<MetricRecord>((row) => {
      const campaignId = row.campaign?.id;
      if (!campaignId) return [];

      return [
        {
          provider: 'GOOGLE_ADS',
          campaignId,
          campaignName: row.campaign?.name ?? campaignId,
          currencyCode,
          spend: toNumber(row.metrics?.costMicros) / 1_000_000,
          impressions: toNumber(row.metrics?.impressions),
          clicks: toNumber(row.metrics?.clicks),
          leads: toNumber(row.metrics?.conversions),
          customers: 0,
          revenue: toNumber(row.metrics?.conversionsValue),
        },
      ];
    });

    return { provider: 'GOOGLE_ADS', configured: true, records, currencyCode };
  }

  private metaUrl(path: string, params: Record<string, string | undefined>) {
    const version =
      optionalEnv('META_GRAPH_API_VERSION') ?? DEFAULT_META_GRAPH_API_VERSION;
    if (!/^v\d+\.\d+$/.test(version)) {
      throw new Error('META_GRAPH_API_VERSION must use the form vNN.N.');
    }

    const accessToken = requiredEnv('META_ACCESS_TOKEN');
    const url = new URL(`https://graph.facebook.com/${version}/${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const appSecret = optionalEnv('META_APP_SECRET');
    if (appSecret) {
      url.searchParams.set(
        'appsecret_proof',
        createHmac('sha256', appSecret).update(accessToken).digest('hex'),
      );
    }

    return { url, accessToken };
  }

  private async metaFetch<T>(
    path: string,
    params: Record<string, string | undefined>,
  ) {
    const { url, accessToken } = this.metaUrl(path, params);
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const payload = (await response.json()) as T & { error?: MetaGraphError };

    if (!response.ok || payload.error) {
      throw new Error(
        payload.error?.message ??
          `Meta Graph API failed with ${response.status}`,
      );
    }

    return payload;
  }

  private async metaListAll<T>(
    path: string,
    params: Record<string, string | undefined>,
  ) {
    const records: T[] = [];
    let after: string | undefined;

    do {
      const page = await this.metaFetch<MetaPage<T>>(path, {
        ...params,
        limit: '500',
        after,
      });
      records.push(...(page.data ?? []));
      after = page.paging?.next ? page.paging.cursors?.after : undefined;
    } while (after);

    return records;
  }

  private async syncMeta(range: DateRange): Promise<ProviderSyncResult> {
    if (!this.isMetaConfigured()) {
      return { provider: 'META_ADS', configured: false, records: [] };
    }

    const rawAccountId = requiredEnv('META_AD_ACCOUNT_ID').replace(/^act_/, '');
    const accountPath = `act_${rawAccountId}`;
    const [account, campaigns, insights] = await Promise.all([
      this.metaFetch<MetaAccount>(accountPath, {
        fields: 'id,account_id,currency',
      }),
      this.metaListAll<MetaCampaign>(`${accountPath}/campaigns`, {
        fields: 'id,name',
      }),
      this.metaListAll<MetaInsight>(`${accountPath}/insights`, {
        fields:
          'campaign_id,date_start,impressions,clicks,spend,actions,action_values',
        level: 'campaign',
        time_increment: '1',
        time_range: JSON.stringify({
          since: range.startDate,
          until: range.endDate,
        }),
      }),
    ]);
    const currencyCode = account.currency?.toUpperCase();
    const campaignNames = new Map(
      campaigns
        .filter((campaign): campaign is MetaCampaign & { id: string } =>
          Boolean(campaign.id),
        )
        .map((campaign) => [campaign.id, campaign.name ?? campaign.id]),
    );

    const records = insights.flatMap<MetricRecord>((insight) => {
      const campaignId = insight.campaign_id;
      if (!campaignId) return [];

      const leads = firstMetaActionValue(insight.actions, [
        'lead',
        'onsite_conversion.lead_grouped',
      ]);
      const customers = firstMetaActionValue(insight.actions, [
        'purchase',
        'omni_purchase',
      ]);
      const revenue = firstMetaActionValue(insight.action_values, [
        'purchase',
        'omni_purchase',
      ]);

      return [
        {
          provider: 'META_ADS',
          campaignId,
          campaignName: campaignNames.get(campaignId) ?? campaignId,
          currencyCode,
          spend: toNumber(insight.spend),
          impressions: toNumber(insight.impressions),
          clicks: toNumber(insight.clicks),
          leads,
          customers,
          revenue,
        },
      ];
    });

    return { provider: 'META_ADS', configured: true, records, currencyCode };
  }

  private buildSnapshots(
    results: ProviderSyncResult[],
    range: DateRange,
  ): VylinoMarketingSnapshotInput[] {
    const snapshots: VylinoMarketingSnapshotInput[] = [];
    const rangeFields = rangeAsIso(range);
    const syncedAt = new Date().toISOString();

    for (const result of results.filter((item) => item.configured)) {
      const totals = aggregateMetrics(result.records);
      snapshots.push({
        snapshotKey: `${result.provider}:LAST_30_DAYS:ACCOUNT`,
        provider: result.provider,
        period: 'LAST_30_DAYS',
        scope: 'ACCOUNT',
        ...rangeFields,
        currencyCode: result.currencyCode,
        ...totals,
        syncedAt,
      });

      for (const [campaignId, records] of groupCampaigns(result.records)) {
        const totalsForCampaign = aggregateMetrics(records);
        snapshots.push({
          snapshotKey: `${result.provider}:LAST_30_DAYS:CAMPAIGN:${campaignId}`,
          provider: result.provider,
          period: 'LAST_30_DAYS',
          scope: 'CAMPAIGN',
          externalCampaignId: campaignId,
          campaignName: records[0]?.campaignName ?? campaignId,
          ...rangeFields,
          currencyCode: result.currencyCode,
          ...totalsForCampaign,
          syncedAt,
        });
      }
    }

    const configured = results.filter((item) => item.configured);
    const currencies = new Set(
      configured
        .map((item) => item.currencyCode)
        .filter((value): value is string => Boolean(value)),
    );

    if (configured.length > 0 && currencies.size <= 1) {
      const allRecords = configured.flatMap((item) => item.records);
      const totals = aggregateMetrics(allRecords);
      snapshots.unshift({
        snapshotKey: 'ALL:LAST_30_DAYS:ACCOUNT',
        provider: 'ALL',
        period: 'LAST_30_DAYS',
        scope: 'ACCOUNT',
        ...rangeFields,
        currencyCode: [...currencies][0],
        ...totals,
        syncedAt,
      });
    }

    return snapshots;
  }

  async execute() {
    if (!this.isConfigured()) {
      throw new Error('Paid marketing executor is not configured.');
    }

    const range = rollingThirtyDays();
    const [google, meta] = await Promise.all([
      this.syncGoogle(range),
      this.syncMeta(range),
    ]);
    const configuredResults = [google, meta].filter(
      (result) => result.configured,
    );

    if (configuredResults.some((result) => result.records.length === 0)) {
      throw new Error(
        'A configured paid-marketing provider returned no metric rows; existing snapshots were left unchanged.',
      );
    }

    const snapshots = this.buildSnapshots([google, meta], range);
    if (snapshots.length === 0) {
      throw new Error('No paid-marketing snapshots were generated.');
    }

    const transport = new VylinoMarketingSnapshotTransport(
      requiredEnv('VYLINO_TWENTY_GRAPHQL_URL'),
      requiredEnv('VYLINO_TWENTY_API_KEY'),
    );
    const persisted = await transport.upsertMany(snapshots);

    return {
      ok: true as const,
      processedRecords: configuredResults.reduce(
        (total, result) => total + result.records.length,
        0,
      ),
      processedSnapshots: persisted.processed,
      createdSnapshots: persisted.created,
      updatedSnapshots: persisted.updated,
      providers: configuredResults.map((result) => result.provider),
      range,
    };
  }
}
