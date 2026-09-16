import { createHmac } from 'crypto';

import type { MetaAdsApiClient } from './adapter';
import { metaAdsConfig, normalizeMetaAdAccountId } from './config';
import { getMetaActionValue, normalizeMetaConversions, type MetaAction } from './metrics';
import { buildMetaFieldsParam, metaAdsFields } from './queries';
import type { MetaAdsRecord } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_PAGE_LIMIT = 500;

type Environment = Record<string, string | undefined>;

type MetaDateRange = {
  startDate: string;
  endDate: string;
};

type MetaGraphApiClientOptions = {
  env?: Environment;
  fetchImpl?: typeof fetch;
  apiVersion?: string;
  timeoutMs?: number;
  getDateRange?: () => MetaDateRange;
};

type MetaGraphError = {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
};

type MetaPage<T> = {
  data?: T[];
  paging?: {
    cursors?: {
      after?: string;
    };
  };
  error?: MetaGraphError;
};

type RawMetaAccount = {
  id?: string;
  name?: string;
  account_id?: string;
  currency?: string;
  timezone_name?: string;
  account_status?: number | string;
  error?: MetaGraphError;
};

type RawMetaCampaign = {
  id?: string;
  name?: string;
  objective?: string;
  status?: string;
  effective_status?: string;
  buying_type?: string;
  created_time?: string;
  updated_time?: string;
};

type RawMetaInsight = {
  account_id?: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  date_start?: string;
  date_stop?: string;
  impressions?: string | number;
  reach?: string | number;
  clicks?: string | number;
  inline_link_clicks?: string | number;
  spend?: string | number;
  cpm?: string | number;
  cpc?: string | number;
  ctr?: string | number;
  actions?: MetaAction[];
  action_values?: MetaAction[];
};

const requiredEnv = (env: Environment, key: string) => {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required Meta Ads environment variable: ${key}`);
  }

  return value;
};

const normalizeApiVersion = (value: string) => {
  const normalized = value.trim();

  if (!/^v\d+\.\d+$/.test(normalized)) {
    throw new Error('Meta Graph API version must use the form vNN.N.');
  }

  return normalized;
};

const toNumber = (value: string | number | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toOptionalNumber = (value: string | number | undefined) =>
  value === undefined ? undefined : toNumber(value);

const toUtcDate = (date: Date) => date.toISOString().slice(0, 10);

const defaultDateRange = (): MetaDateRange => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  return {
    startDate: toUtcDate(start),
    endDate: toUtcDate(end),
  };
};

const validateDateRange = (range: MetaDateRange) => {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!pattern.test(range.startDate) || !pattern.test(range.endDate)) {
    throw new Error('Meta Ads date range must use YYYY-MM-DD values.');
  }

  if (range.startDate > range.endDate) {
    throw new Error('Meta Ads start date must not be after end date.');
  }
};

export class MetaGraphApiClient implements MetaAdsApiClient {
  private readonly env: Environment;
  private readonly fetchImpl: typeof fetch;
  private readonly apiVersion: string;
  private readonly timeoutMs: number;
  private readonly getDateRange: () => MetaDateRange;
  private readonly accessToken: string;
  private readonly appSecretProof?: string;

  constructor(options: MetaGraphApiClientOptions = {}) {
    this.env = options.env ?? process.env;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.apiVersion = normalizeApiVersion(
      options.apiVersion ??
        requiredEnv(this.env, metaAdsConfig.graphApiVersionEnvKey),
    );
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.getDateRange = options.getDateRange ?? defaultDateRange;
    this.accessToken = requiredEnv(this.env, metaAdsConfig.accessTokenEnvKey);

    const appSecret = this.env[metaAdsConfig.appSecretEnvKey]?.trim();
    if (appSecret) {
      this.appSecretProof = createHmac('sha256', appSecret)
        .update(this.accessToken)
        .digest('hex');
    }
  }

  private buildUrl(path: string, params: Record<string, string | undefined>) {
    const url = new URL(`https://graph.facebook.com/${this.apiVersion}/${path}`);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    if (this.appSecretProof) {
      url.searchParams.set('appsecret_proof', this.appSecretProof);
    }

    return url;
  }

  private async fetchJson<T>(url: URL): Promise<T> {
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${this.accessToken}`,
      },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const payload = (await response.json()) as T & { error?: MetaGraphError };

    if (!response.ok || payload.error) {
      throw new Error(
        payload.error?.message ??
          `Meta Graph API request failed with ${response.status}`,
      );
    }

    return payload;
  }

  private async listAll<T>(
    path: string,
    params: Record<string, string | undefined>,
  ) {
    const records: T[] = [];
    let after: string | undefined;

    do {
      const page = await this.fetchJson<MetaPage<T>>(
        this.buildUrl(path, {
          ...params,
          limit: String(DEFAULT_PAGE_LIMIT),
          after,
        }),
      );

      records.push(...(page.data ?? []));
      after = page.paging?.cursors?.after;
    } while (after);

    return records;
  }

  private async getAccount(accountId: string) {
    return this.fetchJson<RawMetaAccount>(
      this.buildUrl(normalizeMetaAdAccountId(accountId), {
        fields: buildMetaFieldsParam(metaAdsFields.account),
      }),
    );
  }

  async testConnection(accountId: string): Promise<boolean> {
    try {
      const account = await this.getAccount(accountId);
      return Boolean(account.id || account.account_id);
    } catch {
      return false;
    }
  }

  async syncRecords(input: {
    accountId: string;
  }): Promise<{
    records: MetaAdsRecord[];
    syncedAt: string;
  }> {
    const accountPath = normalizeMetaAdAccountId(input.accountId);
    const range = this.getDateRange();
    validateDateRange(range);

    const [account, campaigns, insights] = await Promise.all([
      this.getAccount(input.accountId),
      this.listAll<RawMetaCampaign>(`${accountPath}/campaigns`, {
        fields: buildMetaFieldsParam(metaAdsFields.campaign),
      }),
      this.listAll<RawMetaInsight>(`${accountPath}/insights`, {
        fields: buildMetaFieldsParam(metaAdsFields.insights),
        level: 'campaign',
        time_increment: '1',
        time_range: JSON.stringify({
          since: range.startDate,
          until: range.endDate,
        }),
      }),
    ]);

    const records: MetaAdsRecord[] = [];
    const normalizedAccountId =
      account.account_id ?? input.accountId.replace(/^act_/, '');

    if (account.id || account.account_id) {
      records.push({
        kind: 'account',
        data: {
          id: account.id ?? accountPath,
          name: account.name ?? normalizedAccountId,
          accountId: normalizedAccountId,
          currency: account.currency,
          timezoneName: account.timezone_name,
          status: toOptionalNumber(account.account_status),
        },
      });
    }

    for (const campaign of campaigns) {
      if (!campaign.id) continue;

      records.push({
        kind: 'campaign',
        data: {
          id: campaign.id,
          accountId: normalizedAccountId,
          name: campaign.name ?? campaign.id,
          objective: campaign.objective,
          status: campaign.status,
          effectiveStatus: campaign.effective_status,
          buyingType: campaign.buying_type,
          createdTime: campaign.created_time,
          updatedTime: campaign.updated_time,
        },
      });
    }

    for (const insight of insights) {
      if (!insight.date_start || !insight.date_stop) continue;

      const conversions = normalizeMetaConversions(insight.actions);
      const purchaseValue = getMetaActionValue(insight.action_values, [
        'purchase',
        'omni_purchase',
      ]);

      records.push({
        kind: 'insight',
        data: {
          accountId: insight.account_id ?? normalizedAccountId,
          campaignId: insight.campaign_id,
          adSetId: insight.adset_id,
          adId: insight.ad_id,
          dateStart: insight.date_start,
          dateStop: insight.date_stop,
          impressions: toNumber(insight.impressions),
          reach: toOptionalNumber(insight.reach),
          clicks: toOptionalNumber(insight.clicks),
          inlineLinkClicks: toOptionalNumber(insight.inline_link_clicks),
          spend: toNumber(insight.spend),
          cpm: toOptionalNumber(insight.cpm),
          cpc: toOptionalNumber(insight.cpc),
          ctr: toOptionalNumber(insight.ctr),
          conversions: conversions.conversions,
          leads: conversions.leads,
          purchases: conversions.purchases,
          purchaseValue,
        },
      });
    }

    return {
      records,
      syncedAt: new Date().toISOString(),
    };
  }
}
