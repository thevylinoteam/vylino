import type {
  VylinoIntegrationConnection,
  VylinoSyncCursor,
} from '../types';
import type {
  VylinoProviderAdapter,
  VylinoSyncResult,
} from '../provider-adapter';
import type { MetaAdsRecord } from './types';

export class MetaAdsAdapter implements VylinoProviderAdapter<MetaAdsRecord> {
  readonly provider = 'meta_ads' as const;

  async testConnection(
    connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }> {
    if (connection.provider !== this.provider) {
      return { ok: false, message: 'Connection provider mismatch.' };
    }

    if (connection.status !== 'connected') {
      return { ok: false, message: 'Meta Ads connection is not active.' };
    }

    return {
      ok: true,
      message:
        'Meta Ads connection metadata is valid. Live API verification is performed by the runtime connector.',
    };
  }

  async sync(
    connection: VylinoIntegrationConnection,
    cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<MetaAdsRecord>> {
    const connectionCheck = await this.testConnection(connection);

    if (!connectionCheck.ok) {
      throw new Error(connectionCheck.message ?? 'Meta Ads connection failed.');
    }

    return {
      records: [],
      nextCursor: cursor,
      syncedAt: new Date().toISOString(),
    };
  }
}
