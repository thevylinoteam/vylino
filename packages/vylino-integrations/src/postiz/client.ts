import { normalizePostizBaseUrl, type VylinoPostizConfig } from './config';

export type PostizRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
};

export class VylinoPostizClient {
  constructor(private readonly config: VylinoPostizConfig) {}

  async request<T>({ method = 'GET', path, body }: PostizRequestOptions): Promise<T> {
    const apiKey = process.env[this.config.apiKeyEnv];

    if (!apiKey) {
      throw new Error(`Missing Postiz API key environment variable: ${this.config.apiKeyEnv}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const response = await fetch(`${normalizePostizBaseUrl(this.config.baseUrl)}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Postiz request failed with HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
