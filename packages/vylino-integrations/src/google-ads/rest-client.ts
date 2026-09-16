import type { GoogleAdsApiClient } from './adapter';
import type { GoogleAdsConnectionConfig, GoogleAdsNormalizedRecord } from './types';
import {
  GOOGLE_ADS_ACCOUNT_QUERY,
  GOOGLE_ADS_CAMPAIGN_QUERY,
  buildGoogleAdsDailyMetricsQuery,
} from './queries';

const GOOGLE_OAUTH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v3/token';
const DEFAULT_GOOGLE_ADS_API_VERSION = 'v25';
const DEFAULT_TIMEOUT_MS = 30_000;

type Environment = Record<string, string | undefined>;

type GoogleAdsDateRange = {
  startDate: string;
  endDate: string;
};

type GoogleAdsRestClientOptions = {
  config: GoogleAdsConnectionConfig;
  env?: Environment;
  fetchImpl?: typeof fetch;
  apiVersion?: string;
  timeoutMs?: number;
  getDateRange?: () => GoogleAdsDateRange;
};

type GoogleOAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleAdsRow = {
  customer?: {
    id?: string;
    descriptiveName?: string;
    currencyCode?: string;
    timeZone?: string;
    manager?: boolean;
    testAccount?: boolean;
  };
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    advertisingChannelType?: string;
    startDate?: string;
    endDate?: string;
  };
  segments?: {
    date?: string;
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
  error?: {
    message?: string;
    status?: string;
  };
};

const requiredEnv = (env: Environment, key: string) => {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required Google Ads environment variable: ${key}`);
  }

  return value;
};

const toNumber = (value: string | number | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toUtcDate = (date: Date) => date.toISOString().slice(0, 10);

const defaultDateRange = (): GoogleAdsDateRange => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  return {
    startDate: toUtcDate(start),
    endDate: toUtcDate(end),
  };
};

const normalizeApiVersion = (value: string) => {
  const normalized = value.trim();

  if (!/^v\d+$/.test(normalized)) {
    throw new Error('Google Ads API version must use the form vNN.');
  }

  return normalized;
};

export class GoogleAdsRestApiClient implements GoogleAdsApiClient {
  private readonly env: Environment;
  private readonly fetchImpl: typeof fetch;
  private readonly apiVersion: string;
  private readonly timeoutMs: number;
  private readonly getDateRange: () => GoogleAdsDateRange;
  private accessToken?: { value: string; expiresAt: number };

  constructor(private readonly options: GoogleAdsRestClientOptions) {
    this.env = options.env ?? process.env;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.apiVersion = normalizeApiVersion(
      options.apiVersion ??
        this.env.GOOGLE_ADS_API_VERSION ??
        DEFAULT_GOOGLE_ADS_API_VERSION,
    );
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.getDateRange = options.getDateRange ?? defaultDateRange;
  }

  private async getAccessToken() {
    const now = Date.now();

    if (this.accessToken && this.accessToken.expiresAt - 60_000 > now) {
      return this.accessToken.value;
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: requiredEnv(this.env, this.options.config.clientIdEnvKey),
      client_secret: requiredEnv(
        this.env,
        this.options.config.clientSecretEnvKey,
      ),
      refresh_token: requiredEnv(
        this.env,
        this.options.config.refreshTokenEnvKey,
      ),
    });

    const response = await this.fetchImpl(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const payload = (await response.json()) as GoogleOAuthTokenResponse;

    if (!response.ok || !payload.access_token) {
      throw new Error(
        payload.error_description ??
          payload.error ??
          `Google OAuth token request failed with ${response.status}`,
      );
    }

    this.accessToken = {
      value: payload.access_token,
      expiresAt: now + Math.max(60, payload.expires_in ?? 3600) * 1000,
    };

    return this.accessToken.value;
  }

  private async headers() {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      authorization: `Bearer ${await this.getAccessToken()}`,
    };

    const legacyDeveloperToken =
      this.env[this.options.config.developerTokenEnvKey]?.trim();

    if (legacyDeveloperToken) {
      headers['developer-token'] = legacyDeveloperToken;
    }

    if (this.options.config.loginCustomerId) {
      headers['login-customer-id'] = this.options.config.loginCustomerId;
    }

    return headers;
  }

  private async search(customerId: string, query: string) {
    const rows: GoogleAdsRow[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.fetchImpl(
        `https://googleads.googleapis.com/${this.apiVersion}/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          headers: await this.headers(),
          body: JSON.stringify({
            query,
            ...(pageToken ? { pageToken } : {}),
          }),
          signal: AbortSignal.timeout(this.timeoutMs),
        },
      );
      const payload = (await response.json()) as GoogleAdsSearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(
          payload.error?.message ??
            `Google Ads search request failed with ${response.status}`,
        );
      }

      rows.push(...(payload.results ?? []));
      pageToken = payload.nextPageToken;
    } while (pageToken);

    return rows;
  }

  async testConnection(customerId: string): Promise<boolean> {
    try {
      const rows = await this.search(customerId.replace(/-/g, ''), GOOGLE_ADS_ACCOUNT_QUERY);
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  async syncRecords(input: {
    customerId: string;
  }): Promise<{
    records: GoogleAdsNormalizedRecord[];
    syncedAt: string;
  }> {
    const customerId = input.customerId.replace(/-/g, '');
    const range = this.getDateRange();
    const metricsQuery = buildGoogleAdsDailyMetricsQuery(
      range.startDate,
      range.endDate,
    );

    const [accountRows, campaignRows, metricRows] = await Promise.all([
      this.search(customerId, GOOGLE_ADS_ACCOUNT_QUERY),
      this.search(customerId, GOOGLE_ADS_CAMPAIGN_QUERY),
      this.search(customerId, metricsQuery),
    ]);

    const records: GoogleAdsNormalizedRecord[] = [];

    for (const row of accountRows) {
      const account = row.customer;
      if (!account?.id) continue;

      records.push({
        kind: 'account',
        data: {
          customerId: account.id,
          descriptiveName: account.descriptiveName ?? account.id,
          currencyCode: account.currencyCode ?? '',
          timeZone: account.timeZone ?? '',
          manager: Boolean(account.manager),
          testAccount: Boolean(account.testAccount),
        },
      });
    }

    for (const row of campaignRows) {
      const campaign = row.campaign;
      if (!campaign?.id) continue;

      const status = campaign.status;
      const normalizedStatus =
        status === 'ENABLED' ||
        status === 'PAUSED' ||
        status === 'REMOVED' ||
        status === 'UNKNOWN' ||
        status === 'UNSPECIFIED'
          ? status
          : 'UNKNOWN';

      records.push({
        kind: 'campaign',
        data: {
          id: campaign.id,
          customerId,
          name: campaign.name ?? campaign.id,
          status: normalizedStatus,
          advertisingChannelType: campaign.advertisingChannelType,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
        },
      });
    }

    for (const row of metricRows) {
      const campaignId = row.campaign?.id;
      const date = row.segments?.date;

      if (!campaignId || !date) continue;

      records.push({
        kind: 'daily_metrics',
        data: {
          customerId,
          campaignId,
          date,
          impressions: toNumber(row.metrics?.impressions),
          clicks: toNumber(row.metrics?.clicks),
          costMicros: toNumber(row.metrics?.costMicros),
          conversions: toNumber(row.metrics?.conversions),
          conversionValue: toNumber(row.metrics?.conversionsValue),
        },
      });
    }

    return {
      records,
      syncedAt: new Date().toISOString(),
    };
  }
}
