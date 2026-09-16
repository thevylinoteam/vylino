export type VylinoN8nConfig = {
  baseUrl: string;
  webhookUrl: string;
  apiKey?: string;
  webhookSecret?: string;
  timeoutMs: number;
  maxAttempts: number;
};

export const loadVylinoN8nConfig = (
  env: NodeJS.ProcessEnv = process.env,
): VylinoN8nConfig => {
  const baseUrl = env.VYLINO_N8N_BASE_URL?.trim() ?? '';
  const webhookUrl = env.VYLINO_N8N_WEBHOOK_URL?.trim() ?? '';

  if (!baseUrl) {
    throw new Error('VYLINO_N8N_BASE_URL is required');
  }

  if (!webhookUrl) {
    throw new Error('VYLINO_N8N_WEBHOOK_URL is required');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    webhookUrl,
    apiKey: env.VYLINO_N8N_API_KEY?.trim() || undefined,
    webhookSecret: env.VYLINO_N8N_WEBHOOK_SECRET?.trim() || undefined,
    timeoutMs: Number(env.VYLINO_N8N_TIMEOUT_MS ?? 10000),
    maxAttempts: Number(env.VYLINO_N8N_MAX_ATTEMPTS ?? 5),
  };
};
