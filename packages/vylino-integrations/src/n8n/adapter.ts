import type {
  VylinoIntegrationConnection,
  VylinoSyncCursor,
} from '../types';
import type {
  VylinoProviderAdapter,
  VylinoSyncResult,
} from '../provider-adapter';
import type { VylinoAutomationEvent } from './types';
import type { VylinoN8nConfig } from './config';
import { VylinoN8nWebhookClient } from './webhook-client';

export class VylinoN8nAdapter
  implements VylinoProviderAdapter<VylinoAutomationEvent>
{
  readonly provider = 'n8n' as const;

  private readonly client: VylinoN8nWebhookClient;

  constructor(private readonly config: VylinoN8nConfig) {
    this.client = new VylinoN8nWebhookClient(config);
  }

  async testConnection(
    _connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'GET',
      });

      return {
        ok: response.ok,
        message: response.ok
          ? 'n8n endpoint is reachable'
          : `n8n endpoint returned ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to reach n8n',
      };
    }
  }

  async sync(
    _connection: VylinoIntegrationConnection,
    _cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<VylinoAutomationEvent>> {
    return {
      records: [],
      syncedAt: new Date().toISOString(),
    };
  }

  async emit(event: VylinoAutomationEvent): Promise<{
    ok: boolean;
    status: number;
  }> {
    const response = await this.client.deliver(event);

    return {
      ok: response.ok,
      status: response.status,
    };
  }
}
