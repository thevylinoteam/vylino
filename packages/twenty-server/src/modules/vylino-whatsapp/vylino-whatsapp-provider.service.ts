import { Injectable } from '@nestjs/common';

import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  VylinoNormalizedWhatsAppMessage,
  VylinoWhatsAppProvider,
  VylinoWhatsAppSendResult,
} from './vylino-whatsapp.types';

export type VylinoWhatsAppDeliveryStatus = {
  messageId: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  error?: string;
};

@Injectable()
export class VylinoWhatsAppProviderService {
  get provider(): VylinoWhatsAppProvider {
    return process.env.VYLINO_WHATSAPP_PROVIDER?.toUpperCase() === 'EVOLUTION'
      ? 'EVOLUTION'
      : 'META_CLOUD';
  }

  get isConfigured() {
    if (this.provider === 'EVOLUTION') {
      return Boolean(
        process.env.EVOLUTION_API_BASE_URL &&
          process.env.EVOLUTION_API_KEY &&
          process.env.EVOLUTION_INSTANCE_NAME,
      );
    }

    return Boolean(
      process.env.WHATSAPP_CLOUD_ACCESS_TOKEN &&
        process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID,
    );
  }

  verifyMetaSignature(rawBody: Buffer, signatureHeader?: string) {
    const appSecret =
      process.env.VYLINO_WHATSAPP_META_APP_SECRET ?? process.env.META_APP_SECRET;
    if (!appSecret || !signatureHeader?.startsWith('sha256=')) return false;

    const hex = signatureHeader.slice('sha256='.length);
    if (!/^[0-9a-f]{64}$/i.test(hex)) return false;
    const expected = createHmac('sha256', appSecret).update(rawBody).digest();
    const supplied = Buffer.from(hex, 'hex');

    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  }

  parseMetaWebhook(payload: unknown) {
    if (!payload || typeof payload !== 'object') {
      return { messages: [], statuses: [] };
    }

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
            statuses?: Array<{
              id?: string;
              status?: string;
              errors?: Array<{ title?: string; message?: string }>;
            }>;
          };
        }>;
      }>;
    };

    const messages: VylinoNormalizedWhatsAppMessage[] = [];
    const statuses: VylinoWhatsAppDeliveryStatus[] = [];

    for (const entry of root.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;
        const names = new Map(
          (value.contacts ?? [])
            .filter((contact) => contact.wa_id)
            .map((contact) => [contact.wa_id as string, contact.profile?.name]),
        );

        for (const message of value.messages ?? []) {
          if (!message.id || !message.from) continue;
          messages.push({
            provider: 'META_CLOUD',
            externalMessageId: message.id,
            waId: message.from,
            displayName: names.get(message.from),
            messageType: message.type ?? 'unknown',
            text:
              message.text?.body ??
              message.button?.text ??
              message.interactive?.button_reply?.title ??
              message.interactive?.list_reply?.title,
            timestamp: message.timestamp
              ? new Date(Number(message.timestamp) * 1000).toISOString()
              : new Date().toISOString(),
          });
        }

        for (const status of value.statuses ?? []) {
          if (!status.id || !status.status) continue;
          const normalized = status.status.toUpperCase();
          if (!['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(normalized)) {
            continue;
          }
          statuses.push({
            messageId: status.id,
            status: normalized as VylinoWhatsAppDeliveryStatus['status'],
            error: status.errors?.[0]?.title ?? status.errors?.[0]?.message,
          });
        }
      }
    }

    return { messages, statuses };
  }

  parseEvolutionWebhook(payload: unknown): VylinoNormalizedWhatsAppMessage[] {
    if (!payload || typeof payload !== 'object') return [];
    const event = payload as {
      event?: string;
      data?: {
        key?: { id?: string; remoteJid?: string; fromMe?: boolean };
        pushName?: string;
        messageType?: string;
        message?: {
          conversation?: string;
          extendedTextMessage?: { text?: string };
          buttonsResponseMessage?: { selectedDisplayText?: string };
          listResponseMessage?: { title?: string; singleSelectReply?: { selectedRowId?: string } };
        };
        messageTimestamp?: number | string;
      };
    };

    if (!event.event?.toLowerCase().includes('messages.upsert')) return [];
    const data = event.data;
    if (!data?.key?.id || !data.key.remoteJid || data.key.fromMe) return [];

    const waId = data.key.remoteJid.split('@')[0];
    const text =
      data.message?.conversation ??
      data.message?.extendedTextMessage?.text ??
      data.message?.buttonsResponseMessage?.selectedDisplayText ??
      data.message?.listResponseMessage?.title ??
      data.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    const timestampNumber = Number(data.messageTimestamp);
    return [
      {
        provider: 'EVOLUTION',
        externalMessageId: data.key.id,
        waId,
        displayName: data.pushName,
        messageType: data.messageType ?? 'unknown',
        text,
        timestamp: Number.isFinite(timestampNumber)
          ? new Date(timestampNumber * 1000).toISOString()
          : new Date().toISOString(),
      },
    ];
  }

  async sendText(to: string, text: string): Promise<VylinoWhatsAppSendResult> {
    return this.provider === 'EVOLUTION'
      ? this.sendEvolutionText(to, text)
      : this.sendMetaText(to, text);
  }

  async sendTemplate(input: {
    to: string;
    templateName: string;
    languageCode: string;
    components?: unknown[];
  }): Promise<VylinoWhatsAppSendResult> {
    if (this.provider !== 'META_CLOUD') {
      throw new Error('WhatsApp templates require the META_CLOUD transport');
    }

    return this.sendMeta({
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.languageCode },
        ...(input.components ? { components: input.components } : {}),
      },
    });
  }

  private async sendMeta(body: Record<string, unknown>) {
    const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      throw new Error('Meta WhatsApp Cloud API is not configured');
    }

    const version = process.env.WHATSAPP_CLOUD_GRAPH_API_VERSION ?? 'v26.0';
    const response = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      },
    );
    const payload = (await response.json()) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };
    if (!response.ok || !payload.messages?.[0]?.id) {
      throw new Error(
        payload.error?.message ?? `Meta WhatsApp send failed: ${response.status}`,
      );
    }
    return { messageId: payload.messages[0].id, acceptedAt: new Date().toISOString() };
  }

  private sendMetaText(to: string, text: string) {
    return this.sendMeta({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text, preview_url: true },
    });
  }

  private async sendEvolutionText(to: string, text: string) {
    const baseUrl = process.env.EVOLUTION_API_BASE_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;
    if (!baseUrl || !apiKey || !instance) {
      throw new Error('Evolution API is not configured');
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(instance)}`,
      {
        method: 'POST',
        headers: { apikey: apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          number: to,
          textMessage: { text },
          linkPreview: true,
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    const payload = (await response.json()) as {
      key?: { id?: string };
      message?: string;
    };
    if (!response.ok || !payload.key?.id) {
      throw new Error(payload.message ?? `Evolution API send failed: ${response.status}`);
    }
    return { messageId: payload.key.id, acceptedAt: new Date().toISOString() };
  }
}
