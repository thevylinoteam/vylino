import type {
  VylinoIntegrationConnection,
  VylinoSyncCursor,
} from '../types';
import type {
  VylinoProviderAdapter,
  VylinoSyncResult,
} from '../provider-adapter';
import type { MetaAdsRecord } from './types';

export interface MetaAdsApiClient {
  testConnection(accountId: string): Promise<boolean>;
  syncRecords(input: {
    accountId: string;
    cursor?: VylinoSyncCursor;
  }): Promise<VylinoSyncResult<MetaAdsRecord>>;
}

export class MetaAdsAdapter implements VylinoProviderAdapter<MetaAdsRecord> {
  readonly provider = 'meta_ads' as const;

  constructor(private readonly client: MetaAdsApiClient) {}

  async testConnection(
    connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }> {
    if (connection.provider !== this.provider) {
      return { ok: false, message: 'Connection provider mismatch.' };
    }

    const accountId = connection.externalAccountId;

    if (!accountId) {
      return { ok: false, message: 'Meta Ads account ID is missing.' };
    }

    if (connection.status !== 'connected') {
      return { ok: false, message: 'Meta Ads connection is not active.' };
    }

    const ok = await this.client.testConnection(accountId);

    return {
      ok,
      message: ok ? undefined : 'Meta Ads connection test failed.',
    };
  }

  async sync(
    connection: VylinoIntegrationConnection,
    cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<MetaAdsRecord>> {
    const accountId = connection.externalAccountId;

    if (!accountId) {
      throw new Error('Meta Ads account ID is missing.');
    }

    const connectionCheck = await this.testConnection(connection);

    if (!connectionCheck.ok) {
      throw new Error(connectionCheck.message ?? 'Meta Ads connection failed.');
    }

    return this.client.syncRecords({ accountId, cursor });
  }
}
