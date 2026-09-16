export type VylinoIntegrationProvider =
  | 'google_ads'
  | 'meta_ads'
  | 'postiz'
  | 'n8n';

export type VylinoConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reauth_required'
  | 'error';

export type VylinoSyncStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed';

export type VylinoIntegrationConnection = {
  id: string;
  workspaceId: string;
  provider: VylinoIntegrationProvider;
  status: VylinoConnectionStatus;
  externalAccountId?: string;
  externalAccountName?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  lastSyncStatus?: VylinoSyncStatus;
  lastErrorCode?: string;
  lastErrorMessage?: string;
};

export type VylinoSyncCursor = {
  provider: VylinoIntegrationProvider;
  connectionId: string;
  resource: string;
  cursor?: string;
  syncedThrough?: string;
};

export type VylinoAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landingPage?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
};
