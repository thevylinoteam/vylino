import type {
  VylinoIntegrationConnection,
  VylinoIntegrationProvider,
  VylinoSyncCursor,
} from './types';

export type VylinoSyncResult<TRecord = unknown> = {
  records: TRecord[];
  nextCursor?: VylinoSyncCursor;
  syncedAt: string;
};

export interface VylinoProviderAdapter<TRecord = unknown> {
  readonly provider: VylinoIntegrationProvider;

  testConnection(
    connection: VylinoIntegrationConnection,
  ): Promise<{ ok: boolean; message?: string }>;

  sync(
    connection: VylinoIntegrationConnection,
    cursor?: VylinoSyncCursor,
  ): Promise<VylinoSyncResult<TRecord>>;
}
