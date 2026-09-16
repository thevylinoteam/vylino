import type { VylinoIntegrationProvider } from './types';

export type VylinoProviderCapability =
  | 'read_campaigns'
  | 'read_metrics'
  | 'read_leads'
  | 'publish_content'
  | 'schedule_content'
  | 'trigger_automation';

export type VylinoProviderDefinition = {
  provider: VylinoIntegrationProvider;
  label: string;
  capabilities: VylinoProviderCapability[];
  readOnlyByDefault: boolean;
};

export const VYLINO_PROVIDER_REGISTRY: Record<
  VylinoIntegrationProvider,
  VylinoProviderDefinition
> = {
  google_ads: {
    provider: 'google_ads',
    label: 'Google Ads',
    capabilities: ['read_campaigns', 'read_metrics'],
    readOnlyByDefault: true,
  },
  meta_ads: {
    provider: 'meta_ads',
    label: 'Meta Ads',
    capabilities: ['read_campaigns', 'read_metrics', 'read_leads'],
    readOnlyByDefault: true,
  },
  postiz: {
    provider: 'postiz',
    label: 'Postiz',
    capabilities: ['publish_content', 'schedule_content'],
    readOnlyByDefault: false,
  },
  n8n: {
    provider: 'n8n',
    label: 'n8n',
    capabilities: ['trigger_automation'],
    readOnlyByDefault: false,
  },
};
