export type VylinoPostizConfig = {
  baseUrl: string;
  apiKeyEnv: string;
  webhookSecretEnv?: string;
  requestTimeoutMs: number;
};

export const DEFAULT_VYLINO_POSTIZ_CONFIG: VylinoPostizConfig = {
  baseUrl: process.env.VYLINO_POSTIZ_BASE_URL ?? 'http://localhost:5000',
  apiKeyEnv: 'VYLINO_POSTIZ_API_KEY',
  webhookSecretEnv: 'VYLINO_POSTIZ_WEBHOOK_SECRET',
  requestTimeoutMs: 30_000,
};

export const normalizePostizBaseUrl = (baseUrl: string): string =>
  baseUrl.replace(/\/+$/, '');
