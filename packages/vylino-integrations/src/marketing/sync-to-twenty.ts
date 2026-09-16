import type { GoogleAdsNormalizedRecord } from '../google-ads/types';
import type { MetaAdsRecord } from '../meta-ads/types';
import type { VylinoProviderAdapter } from '../provider-adapter';
import type {
  VylinoIntegrationConnection,
  VylinoSyncCursor,
} from '../types';
import { mapGoogleAdsMetric, mapMetaAdsInsight } from './mappers';
import {
  buildTwentyMarketingSnapshots,
  publishTwentyMarketingSnapshots,
  type TwentyMarketingSnapshotPeriod,
} from './twenty-snapshots';
import type { MarketingMetricRecord } from './types';

type ProviderSync<TRecord> = {
  adapter: VylinoProviderAdapter<TRecord>;
  connection: VylinoIntegrationConnection;
  cursor?: VylinoSyncCursor;
};

export type PaidMarketingSyncRange = {
  from: string;
  to: string;
};

export type SyncPaidMarketingToTwentyInput = {
  googleAds: ProviderSync<GoogleAdsNormalizedRecord>;
  metaAds: ProviderSync<MetaAdsRecord>;
  period: TwentyMarketingSnapshotPeriod;
  range: PaidMarketingSyncRange;
  twenty: {
    baseUrl: string;
    sharedSecret: string;
    fetchImpl?: typeof fetch;
  };
};

export type SyncPaidMarketingToTwentyResult = {
  googleAds: {
    sourceRecords: number;
    metricRecords: number;
    syncedAt: string;
    nextCursor?: VylinoSyncCursor;
  };
  metaAds: {
    sourceRecords: number;
    metricRecords: number;
    syncedAt: string;
    nextCursor?: VylinoSyncCursor;
  };
  normalizedMetricRecords: number;
  snapshots: number;
  persistence: {
    processed: number;
    created: number;
    updated: number;
  };
};

const parseBoundary = (value: string, label: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid marketing sync ${label}: ${value}`);
  }

  return parsed;
};

const normalizeRange = (range: PaidMarketingSyncRange) => {
  const from = parseBoundary(range.from, 'from date');
  const to = parseBoundary(range.to, 'to date');

  if (from.getTime() > to.getTime()) {
    throw new Error('Marketing sync range start must be before or equal to end.');
  }

  return { from, to };
};

const isWithinRange = (
  date: string,
  range: ReturnType<typeof normalizeRange>,
) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return false;

  const time = parsed.getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
};

const normalizeGoogleAdsRecords = (
  records: GoogleAdsNormalizedRecord[],
  range: ReturnType<typeof normalizeRange>,
): MarketingMetricRecord[] => {
  const currencies = new Map<string, string>();
  const campaignNames = new Map<string, string>();

  for (const record of records) {
    if (record.kind === 'account') {
      currencies.set(record.data.customerId, record.data.currencyCode);
    }

    if (record.kind === 'campaign') {
      campaignNames.set(record.data.id, record.data.name);
    }
  }

  return records.flatMap((record) => {
    if (
      record.kind !== 'daily_metrics' ||
      !isWithinRange(record.data.date, range)
    ) {
      return [];
    }

    return [
      mapGoogleAdsMetric(record.data, {
        campaignName: campaignNames.get(record.data.campaignId),
        currency: currencies.get(record.data.customerId),
      }),
    ];
  });
};

const normalizeMetaAdsRecords = (
  records: MetaAdsRecord[],
  range: ReturnType<typeof normalizeRange>,
): MarketingMetricRecord[] => {
  const currencies = new Map<string, string>();
  const campaignNames = new Map<string, string>();

  for (const record of records) {
    if (record.kind === 'account' && record.data.currency) {
      currencies.set(record.data.accountId, record.data.currency);
    }

    if (record.kind === 'campaign') {
      campaignNames.set(record.data.id, record.data.name);
    }
  }

  return records.flatMap((record) => {
    if (
      record.kind !== 'insight' ||
      !isWithinRange(record.data.dateStart, range)
    ) {
      return [];
    }

    return [
      mapMetaAdsInsight(record.data, {
        campaignName: record.data.campaignId
          ? campaignNames.get(record.data.campaignId)
          : undefined,
        currency: currencies.get(record.data.accountId),
      }),
    ];
  });
};

export const syncPaidMarketingToTwenty = async (
  input: SyncPaidMarketingToTwentyInput,
): Promise<SyncPaidMarketingToTwentyResult> => {
  if (input.googleAds.connection.provider !== 'google_ads') {
    throw new Error('Google Ads sync connection provider mismatch.');
  }

  if (input.metaAds.connection.provider !== 'meta_ads') {
    throw new Error('Meta Ads sync connection provider mismatch.');
  }

  const range = normalizeRange(input.range);

  const [googleResult, metaResult] = await Promise.all([
    input.googleAds.adapter.sync(
      input.googleAds.connection,
      input.googleAds.cursor,
    ),
    input.metaAds.adapter.sync(input.metaAds.connection, input.metaAds.cursor),
  ]);

  const googleMetrics = normalizeGoogleAdsRecords(googleResult.records, range);
  const metaMetrics = normalizeMetaAdsRecords(metaResult.records, range);
  const records = [...googleMetrics, ...metaMetrics];

  if (records.length === 0) {
    throw new Error(
      'Paid marketing sync returned no metric records for the requested range; existing Twenty snapshots were left unchanged.',
    );
  }

  const snapshots = buildTwentyMarketingSnapshots(records, input.period, {
    from: input.range.from,
    to: input.range.to,
  });

  const persistence = await publishTwentyMarketingSnapshots({
    ...input.twenty,
    snapshots,
  });

  return {
    googleAds: {
      sourceRecords: googleResult.records.length,
      metricRecords: googleMetrics.length,
      syncedAt: googleResult.syncedAt,
      nextCursor: googleResult.nextCursor,
    },
    metaAds: {
      sourceRecords: metaResult.records.length,
      metricRecords: metaMetrics.length,
      syncedAt: metaResult.syncedAt,
      nextCursor: metaResult.nextCursor,
    },
    normalizedMetricRecords: records.length,
    snapshots: snapshots.length,
    persistence: {
      processed: persistence.processed,
      created: persistence.created,
      updated: persistence.updated,
    },
  };
};
