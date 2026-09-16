import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  WhatsAppNormalizedMessage,
  WhatsAppSendResult,
  WhatsAppSendTemplateInput,
  WhatsAppSendTextInput,
  WhatsAppTransport,
} from './types';

export type MetaWhatsAppCloudConfig = {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion?: string;
  appSecret?: string;
  requestTimeoutMs?: number;
};

export class MetaWhatsAppCloudClient implements WhatsAppTransport {
  provider = 'META_CLOUD' as const;

  constructor(private readonly config: MetaWhatsAppCloudConfig) {}

  private async request(body: unknown): Promise<{ messages?: Array<{ id: string }> }> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs ?? 15_000,
    );

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.config.graphApiVersion ?? 'v26.0'}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      const payload = (await response.json()) as {
        messages?: Array<{ id: string }>;
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? `Meta WhatsApp request failed: ${response.status}`);
      }
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  async sendText(input: WhatsAppSendTextInput): Promise<WhatsAppSendResult> {
    const payload = await this.request({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to,
      type: 'text',
      text: {
        preview_url: input.previewUrl ?? false,
        body: input.text,
      },
    });

    const messageId = payload.messages?.[0]?.id;
    if (!messageId) throw new Error('Meta WhatsApp did not return a message id');
    return { provider: this.provider, messageId, acceptedAt: new Date().toISOString() };
  }

  async sendTemplate(input: WhatsAppSendTemplateInput): Promise<WhatsAppSendResult> {
    const payload = await this.request({
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.languageCode },
        ...(input.components ? { components: input.components } : {}),
      },
    });

    const messageId = payload.messages?.[0]?.id;
    if (!messageId) throw new Error('Meta WhatsApp did not return a message id');
    return { provider: this.provider, messageId, acceptedAt: new Date().toISOString() };
  }
}

export const verifyMetaWhatsAppSignature = (input: {
  rawBody: string | Buffer;
  signatureHeader?: string;
  appSecret: string;
}): boolean => {
  const prefix = 'sha256=';
  if (!input.signatureHeader?.startsWith(prefix)) return false;
  const suppliedHex = input.signatureHeader.slice(prefix.length);
  if (!/^[0-9a-f]{64}$/i.test(suppliedHex)) return false;

  const expected = createHmac('sha256', input.appSecret)
    .update(input.rawBody)
    .digest();
  const supplied = Buffer.from(suppliedHex, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

export const parseMetaWhatsAppMessages = (
  payload: unknown,
): WhatsAppNormalizedMessage[] => {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
          messages?: Array<{
            id?: string;
            from?: string;
            timestamp?: string;
            type?: string;
            text?: { body?: string };
            button?: { text?: string };
            interactive?: {
              button_reply?: { title?: string };
              list_reply?: { title?: string };
            };
          }>;
        };
      }>;
    }>;
  };

  const normalized: WhatsAppNormalizedMessage[] = [];
  for (const entry of root.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;
      const displayNames = new Map(
        (value.contacts ?? [])
          .filter((contact) => contact.wa_id)
          .map((contact) => [contact.wa_id as string, contact.profile?.name]),
      );

      for (const message of value.messages ?? []) {
        if (!message.id || !message.from) continue;
        const text =
          message.text?.body ??
          message.button?.text ??
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title;
        normalized.push({
          provider: 'META_CLOUD',
          externalMessageId: message.id,
          waId: message.from,
          displayName: displayNames.get(message.from),
          direction: 'INBOUND',
          messageType: message.type ?? 'unknown',
          text,
          timestamp: message.timestamp
            ? new Date(Number(message.timestamp) * 1000).toISOString()
            : new Date().toISOString(),
        });
      }
    }
  }
  return normalized;
};
