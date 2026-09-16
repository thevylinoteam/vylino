import type {
  VylinoProviderAdapter,
  VylinoSyncResult,
} from '../provider-adapter';
import type {
  VylinoIntegrationConnection,
  VylinoSyncCursor,
} from '../types';
import type { GoogleAdsNormalizedRecord } from './types';

export interface GoogleAdsApiClient {
  testConnection(customerId: string): Promise<boolean>;
  syncRecords(input: {
    customerId: string;
    cursor?: VylinoSyncCursor;
  }): Promise<VylinoSyncResult<GoogleAdsNormalizedRecord>>;
}

export class GoogleAdsAdapter
  implements VylinoProviderAdapter<GoogleAdsNormalizedRecord>
{
  readonly provider = 'google_ads' as const;

  constructor(private readonly client: GoogleAdsApiClient) {}

  async testConnection(
    connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }> {
    const customerId = connection.externalAccountId;

    if (!customerId) {
      return { ok: false, message: 'Google Ads customer ID is missing.' };
    }

    const ok = await this.client.testConnection(customerId);

    return {
      ok,
      message: ok ? undefined : 'Google Ads connection test failed.',
    };
  }

  async sync(
    connection: VylinoIntegrationConnection,
    cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<GoogleAdsNormalizedRecord>> {
    const customerId = connection.externalAccountId;

    if (!customerId) {
      throw new Error('Google Ads customer ID is missing.');
    }

    return this.client.syncRecords({ customerId, cursor });
  }
}
