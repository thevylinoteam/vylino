import type { VylinoProviderAdapter, VylinoSyncResult } from '../provider-adapter';
import type { VylinoIntegrationConnection, VylinoSyncCursor } from '../types';
import { DEFAULT_VYLINO_POSTIZ_CONFIG } from './config';
import { VylinoPostizClient } from './client';
import type { VylinoPostizRecord, VylinoSocialPost } from './types';

export type VylinoSocialPublishRequest = {
  post: VylinoSocialPost;
};

export interface VylinoSocialPublisher {
  publish(request: VylinoSocialPublishRequest): Promise<VylinoSocialPost>;
  schedule(request: VylinoSocialPublishRequest): Promise<VylinoSocialPost>;
  cancel(providerPostId: string): Promise<void>;
}

export class VylinoPostizAdapter
  implements VylinoProviderAdapter<VylinoPostizRecord>, VylinoSocialPublisher
{
  readonly provider = 'postiz' as const;

  private readonly client = new VylinoPostizClient(DEFAULT_VYLINO_POSTIZ_CONFIG);

  async testConnection(
    _connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      await this.client.request({ path: '/api/public/v1/integrations' });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unknown Postiz connection error',
      };
    }
  }

  async sync(
    _connection: VylinoIntegrationConnection,
    _cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<VylinoPostizRecord>> {
    // Endpoint mapping is intentionally isolated here because Postiz public API
    // shapes may evolve independently from the normalized Vylino record model.
    return {
      records: [],
      syncedAt: new Date().toISOString(),
    };
  }

  async publish(_request: VylinoSocialPublishRequest): Promise<VylinoSocialPost> {
    throw new Error('Postiz publish mapping is not enabled until endpoint mapping is validated.');
  }

  async schedule(_request: VylinoSocialPublishRequest): Promise<VylinoSocialPost> {
    throw new Error('Postiz schedule mapping is not enabled until endpoint mapping is validated.');
  }

  async cancel(_providerPostId: string): Promise<void> {
    throw new Error('Postiz cancel mapping is not enabled until endpoint mapping is validated.');
  }
}
