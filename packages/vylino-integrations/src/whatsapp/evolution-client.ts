import type {
  WhatsAppSendResult,
  WhatsAppSendTemplateInput,
  WhatsAppSendTextInput,
  WhatsAppTransport,
} from './types';

export type EvolutionWhatsAppConfig = {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
  requestTimeoutMs?: number;
};

export class EvolutionWhatsAppClient implements WhatsAppTransport {
  provider = 'EVOLUTION' as const;

  constructor(private readonly config: EvolutionWhatsAppConfig) {}

  private async post(path: string, body: unknown): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs ?? 15_000,
    );

    try {
      const response = await fetch(
        `${this.config.baseUrl.replace(/\/$/, '')}${path}`,
        {
          method: 'POST',
          headers: {
            apikey: this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );
      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(`Evolution API request failed: ${response.status}`);
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  async sendText(input: WhatsAppSendTextInput): Promise<WhatsAppSendResult> {
    const payload = await this.post(
      `/message/sendText/${encodeURIComponent(this.config.instanceName)}`,
      {
        number: input.to,
        textMessage: { text: input.text },
        linkPreview: input.previewUrl ?? false,
      },
    );

    const key = payload.key as { id?: string } | undefined;
    const messageId = key?.id;
    if (!messageId) throw new Error('Evolution API did not return a message id');
    return { provider: this.provider, messageId, acceptedAt: new Date().toISOString() };
  }

  async sendTemplate(_input: WhatsAppSendTemplateInput): Promise<WhatsAppSendResult> {
    throw new Error(
      'Template messages must use the official WhatsApp Business/Cloud transport. Configure META_CLOUD for template sends.',
    );
  }
}
