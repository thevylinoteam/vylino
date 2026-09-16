import { Injectable } from '@nestjs/common';

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { VylinoGraphqlCrmTransport } from 'src/modules/vylino-lead-ingestion/vylino-graphql-crm.transport';

import { VylinoWhatsAppGraphqlTransport } from './vylino-whatsapp-graphql.transport';
import { VylinoWhatsAppProviderService } from './vylino-whatsapp-provider.service';
import type {
  VylinoCashfreePaymentResult,
  VylinoIntent,
  VylinoIntentResult,
  VylinoNormalizedWhatsAppMessage,
  VylinoServiceCatalogItem,
  VylinoServiceRecommendation,
  VylinoWhatsAppAutomationMode,
  VylinoWhatsAppConversation,
  VylinoWhatsAppWebhookResult,
} from './vylino-whatsapp.types';

const INTENT_TERMS: Record<VylinoIntent, string[]> = {
  GREETING: ['hi', 'hello', 'hey', 'namaste', 'hii'],
  WEBSITE_DEVELOPMENT: [
    'website',
    'web site',
    'wordpress',
    'landing page',
    'redesign',
  ],
  ECOMMERCE: [
    'ecommerce',
    'e-commerce',
    'online store',
    'shopify',
    'woocommerce',
  ],
  SEO: ['seo', 'ranking', 'organic traffic', 'search engine'],
  DIGITAL_MARKETING: [
    'digital marketing',
    'social media marketing',
    'online marketing',
  ],
  ADS: [
    'google ads',
    'meta ads',
    'facebook ads',
    'instagram ads',
    'ppc',
    'paid ads',
  ],
  PRICE: [
    'price',
    'pricing',
    'cost',
    'charges',
    'rate',
    'budget',
    'quotation',
    'quote',
  ],
  PAYMENT: ['payment', 'pay now', 'payment link', 'upi', 'invoice'],
  SUPPORT: [
    'support',
    'problem',
    'issue',
    'not working',
    'complaint',
    'refund',
  ],
  HUMAN: [
    'human',
    'agent',
    'person',
    'executive',
    'call me',
    'talk to someone',
  ],
  OPT_OUT: [
    'stop',
    'unsubscribe',
    'cancel messages',
    'do not message',
    "don't message",
    'opt out',
  ],
  UNKNOWN: [],
};

const INTENT_HINTS: Partial<Record<VylinoIntent, string[]>> = {
  WEBSITE_DEVELOPMENT: ['website', 'wordpress', 'landing page', 'redesign'],
  ECOMMERCE: ['ecommerce', 'shopify', 'woocommerce', 'online store'],
  SEO: ['seo', 'ranking', 'organic', 'search engine'],
  DIGITAL_MARKETING: ['digital marketing', 'social media', 'marketing'],
  ADS: ['google ads', 'meta ads', 'facebook ads', 'instagram ads', 'ppc'],
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+/g, ' ').trim();
const cleanPhone = (waId: string) => waId.replace(/\D/g, '');

@Injectable()
export class VylinoWhatsAppAutomationService {
  constructor(
    private readonly providerService: VylinoWhatsAppProviderService,
  ) {}

  private get transports() {
    const graphqlUrl = process.env.VYLINO_TWENTY_GRAPHQL_URL;
    const apiKey = process.env.VYLINO_TWENTY_API_KEY;
    if (!graphqlUrl || !apiKey) {
      throw new Error('Vylino Twenty GraphQL persistence is not configured');
    }
    return {
      whatsapp: new VylinoWhatsAppGraphqlTransport(graphqlUrl, apiKey),
      crm: new VylinoGraphqlCrmTransport(graphqlUrl, apiKey),
    };
  }

  get enabled() {
    return process.env.VYLINO_WHATSAPP_ENABLED?.toLowerCase() === 'true';
  }

  classify(text: string): VylinoIntentResult {
    const normalized = normalize(text);
    let intent: VylinoIntent = 'UNKNOWN';
    let matchedTerms: string[] = [];

    for (const [candidate, terms] of Object.entries(INTENT_TERMS) as [
      VylinoIntent,
      string[],
    ][]) {
      if (candidate === 'UNKNOWN') continue;
      const matches = terms.filter((term) => normalized.includes(term));
      if (matches.length > matchedTerms.length) {
        intent = candidate;
        matchedTerms = matches;
      }
    }

    return {
      intent,
      confidence:
        intent === 'UNKNOWN'
          ? 0.25
          : Math.min(0.98, 0.62 + matchedTerms.length * 0.12),
      matchedTerms,
    };
  }

  recommend(
    catalog: VylinoServiceCatalogItem[],
    intent: VylinoIntentResult,
    text: string,
  ): VylinoServiceRecommendation[] {
    const normalized = normalize(text);
    const hints = INTENT_HINTS[intent.intent] ?? [];

    return catalog
      .filter((item) => item.isActive !== false)
      .map((item) => {
        const terms = [
          ...(item.keywords ?? '').split(/[;,|]/),
          item.category ?? '',
          ...hints,
        ]
          .map((term) => normalize(term))
          .filter(Boolean);
        const matchedTerms = [...new Set(terms)].filter((term) =>
          normalized.includes(term),
        );
        const catalogText = normalize(
          `${item.name} ${item.category ?? ''} ${item.keywords ?? ''}`,
        );
        const intentBoost = hints.some((hint) => catalogText.includes(hint))
          ? 4
          : 0;
        const score =
          matchedTerms.length * 2 + intentBoost + (item.priority ?? 0) / 100;
        return { item, score, matchedTerms };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  async handleInbound(
    messages: VylinoNormalizedWhatsAppMessage[],
  ): Promise<VylinoWhatsAppWebhookResult> {
    const result: VylinoWhatsAppWebhookResult = {
      processed: 0,
      duplicates: 0,
      replied: 0,
      handoffs: 0,
      optedOut: 0,
      paymentLinks: 0,
    };

    for (const message of messages) {
      const outcome = await this.processInboundMessage(message);
      if (outcome === 'duplicate') result.duplicates += 1;
      else result.processed += 1;
      if (outcome === 'replied') result.replied += 1;
      if (outcome === 'handoff') result.handoffs += 1;
      if (outcome === 'opted_out') result.optedOut += 1;
      if (outcome === 'payment_link') result.paymentLinks += 1;
    }

    return result;
  }

  async processDeliveryStatuses(
    statuses: Array<{ messageId: string; status: string; error?: string }>,
  ) {
    const { whatsapp } = this.transports;
    await Promise.all(
      statuses.map((status) =>
        whatsapp.updateMessageStatus(
          status.messageId,
          status.status,
          status.error,
        ),
      ),
    );
  }

  private async processInboundMessage(
    message: VylinoNormalizedWhatsAppMessage,
  ) {
    const { whatsapp, crm } = this.transports;
    if (await whatsapp.messageExists(message.externalMessageId))
      return 'duplicate' as const;

    const phone = cleanPhone(message.waId);
    const person =
      (await crm.findPersonByPhone(`+${phone}`)) ??
      (await crm.findPersonByPhone(phone)) ??
      (await crm.createPerson({
        firstName: message.displayName?.trim() || 'WhatsApp',
        lastName: '',
        phone: `+${phone}`,
      }));

    const conversationKey = `${message.provider}:${phone}`;
    let conversation = await whatsapp.findConversation(conversationKey);
    const serviceWindowExpiresAt = new Date(
      new Date(message.timestamp).getTime() + 24 * 60 * 60 * 1000,
    ).toISOString();

    if (!conversation) {
      conversation = await whatsapp.createConversation({
        conversationKey,
        waId: phone,
        displayName: message.displayName,
        provider: message.provider,
        status: 'OPEN',
        automationMode:
          (process.env.VYLINO_WHATSAPP_AUTOMATION_MODE_DEFAULT as
            | VylinoWhatsAppAutomationMode
            | undefined) ?? 'BOT',
        personRecordId: person.id,
        lastInboundAt: message.timestamp,
        serviceWindowExpiresAt,
        unreadCount: 1,
        totalMessages: 1,
        lastMessageText: message.text,
      });
    } else {
      conversation = await whatsapp.updateConversation(conversation.id, {
        displayName: message.displayName ?? conversation.displayName,
        personRecordId: conversation.personRecordId ?? person.id,
        lastInboundAt: message.timestamp,
        serviceWindowExpiresAt,
        unreadCount: (conversation.unreadCount ?? 0) + 1,
        totalMessages: (conversation.totalMessages ?? 0) + 1,
        lastMessageText: message.text,
      });
    }

    await whatsapp.createMessage({
      externalMessageId: message.externalMessageId,
      providerMessageId: message.externalMessageId,
      conversationKey,
      waId: phone,
      direction: 'INBOUND',
      messageType: message.messageType,
      body: message.text,
      status: 'RECEIVED',
      isAutomated: false,
      messageAt: message.timestamp,
    });

    if (!this.enabled || !this.providerService.isConfigured)
      return 'persisted' as const;
    if (conversation.status === 'OPTED_OUT') return 'persisted' as const;
    if (
      conversation.automationMode === 'HUMAN' ||
      conversation.automationMode === 'PAUSED'
    ) {
      return 'persisted' as const;
    }

    const text = message.text?.trim();
    if (!text) return 'persisted' as const;
    const intent = this.classify(text);

    if (intent.intent === 'OPT_OUT') {
      await whatsapp.updateConversation(conversation.id, {
        status: 'OPTED_OUT',
        automationMode: 'PAUSED',
        lastIntent: intent.intent,
        lastIntentConfidence: intent.confidence,
      });
      await this.sendAndPersist(
        conversation,
        'You have been opted out of automated WhatsApp messages. If you need help later, message us again and our team can assist.',
        intent,
      );
      return 'opted_out' as const;
    }

    if (
      intent.intent === 'HUMAN' ||
      intent.intent === 'SUPPORT' ||
      intent.confidence < 0.5
    ) {
      await whatsapp.updateConversation(conversation.id, {
        status: 'HUMAN_HANDOFF',
        automationMode: 'HUMAN',
        lastIntent: intent.intent,
        lastIntentConfidence: intent.confidence,
      });
      await this.sendAndPersist(
        conversation,
        'I’m handing this conversation to a team member. They can continue from the context you already shared here.',
        intent,
      );
      return 'handoff' as const;
    }

    const catalog = await whatsapp.listActiveCatalog();
    const recommendations = this.recommend(catalog, intent, text);
    const recommended = recommendations[0]?.item;

    if (intent.intent === 'PAYMENT') {
      const serviceKey =
        recommended?.serviceKey ?? conversation.recommendedServiceKey;
      const item = serviceKey
        ? await whatsapp.findCatalogItem(serviceKey)
        : undefined;
      if (item?.basePrice && item.basePrice > 0) {
        await this.createAndSendPaymentLink(conversation, item);
        return 'payment_link' as const;
      }

      await this.sendAndPersist(
        conversation,
        'Please confirm the service/package you want to pay for. I’ll then create a secure payment link for the correct amount.',
        intent,
      );
      return 'replied' as const;
    }

    const reply = this.buildReply(message.displayName, intent, recommendations);
    await whatsapp.updateConversation(conversation.id, {
      status: 'WAITING_CUSTOMER',
      lastIntent: intent.intent,
      lastIntentConfidence: intent.confidence,
      recommendedServiceKey:
        recommended?.serviceKey ?? conversation.recommendedServiceKey,
    });
    await this.sendAndPersist(conversation, reply, intent);
    return 'replied' as const;
  }

  private buildReply(
    name: string | undefined,
    intent: VylinoIntentResult,
    recommendations: VylinoServiceRecommendation[],
  ) {
    const greeting = name ? `Hi ${name}, ` : 'Hi, ';
    if (intent.intent === 'GREETING') {
      return `${greeting}welcome to Vylino. I can help with website development, ecommerce, SEO, digital marketing, Google/Meta Ads, pricing and support. What would you like help with?`;
    }

    if (recommendations.length === 0) {
      return `${greeting}I can help with website development, ecommerce, SEO, digital marketing and advertising. Tell me your business type, goal and approximate budget, or type *human* to speak with our team.`;
    }

    const options = recommendations.map(({ item }, index) => {
      const price = item.basePrice
        ? ` — ${item.currencyCode ?? 'INR'} ${item.basePrice.toLocaleString('en-IN')}`
        : '';
      return `${index + 1}. *${item.name}*${price}${item.shortDescription ? `\n   ${item.shortDescription}` : ''}`;
    });

    return `${greeting}these options fit your requirement:\n\n${options.join('\n\n')}\n\nReply with the service name, ask for *payment*, or type *human* to speak with our team.`;
  }

  private async sendAndPersist(
    conversation: VylinoWhatsAppConversation,
    text: string,
    intent?: VylinoIntentResult,
  ) {
    const { whatsapp } = this.transports;
    const sent = await this.providerService.sendText(conversation.waId, text);
    await whatsapp.createMessage({
      externalMessageId: sent.messageId,
      providerMessageId: sent.messageId,
      conversationKey: conversation.conversationKey,
      waId: conversation.waId,
      direction: 'OUTBOUND',
      messageType: 'text',
      body: text,
      status: 'SENT',
      isAutomated: true,
      intent: intent?.intent,
      confidence: intent?.confidence,
      messageAt: sent.acceptedAt,
    });
    await whatsapp.updateConversation(conversation.id, {
      lastOutboundAt: sent.acceptedAt,
      totalMessages: (conversation.totalMessages ?? 0) + 1,
      lastMessageText: text,
    });
    return sent;
  }

  async manualSend(input: {
    conversationKey: string;
    text?: string;
    templateName?: string;
    languageCode?: string;
    components?: unknown[];
  }) {
    const { whatsapp } = this.transports;
    const conversation = await whatsapp.findConversation(input.conversationKey);
    if (!conversation) throw new Error('WhatsApp conversation not found');

    const windowOpen =
      Boolean(conversation.serviceWindowExpiresAt) &&
      new Date(conversation.serviceWindowExpiresAt as string).getTime() >
        Date.now();

    const sent = input.templateName
      ? await this.providerService.sendTemplate({
          to: conversation.waId,
          templateName: input.templateName,
          languageCode: input.languageCode ?? 'en',
          components: input.components,
        })
      : input.text && windowOpen
        ? await this.providerService.sendText(conversation.waId, input.text)
        : undefined;

    if (!sent) {
      throw new Error(
        'Free-form messages require an open customer-service window. Use an approved template outside the window.',
      );
    }

    const body = input.text ?? `[template:${input.templateName}]`;
    await whatsapp.createMessage({
      externalMessageId: sent.messageId,
      providerMessageId: sent.messageId,
      conversationKey: conversation.conversationKey,
      waId: conversation.waId,
      direction: 'OUTBOUND',
      messageType: input.templateName ? 'template' : 'text',
      body,
      status: 'SENT',
      isAutomated: false,
      messageAt: sent.acceptedAt,
    });
    await whatsapp.updateConversation(conversation.id, {
      lastOutboundAt: sent.acceptedAt,
      lastMessageText: body,
      totalMessages: (conversation.totalMessages ?? 0) + 1,
    });
    return sent;
  }

  async setHumanMode(conversationKey: string, humanOwner?: string) {
    const { whatsapp } = this.transports;
    const conversation = await whatsapp.findConversation(conversationKey);
    if (!conversation) throw new Error('WhatsApp conversation not found');
    return whatsapp.updateConversation(conversation.id, {
      status: 'HUMAN_HANDOFF',
      automationMode: 'HUMAN',
      humanOwner,
    });
  }

  async releaseToBot(conversationKey: string) {
    const { whatsapp } = this.transports;
    const conversation = await whatsapp.findConversation(conversationKey);
    if (!conversation) throw new Error('WhatsApp conversation not found');
    return whatsapp.updateConversation(conversation.id, {
      status: 'OPEN',
      automationMode: 'BOT',
      humanOwner: null,
      unreadCount: 0,
    });
  }

  async createAndSendPaymentLink(
    conversation: VylinoWhatsAppConversation,
    item: VylinoServiceCatalogItem,
    overrideAmount?: number,
  ) {
    const amount = overrideAmount ?? item.basePrice;
    if (!amount || amount <= 0) throw new Error('Payment amount is required');
    const payment = await this.createCashfreePaymentLink({
      conversation,
      amount,
      currencyCode: item.currencyCode ?? 'INR',
      purpose: item.name,
    });

    const { whatsapp } = this.transports;
    await whatsapp.createPaymentRequest({
      paymentKey: payment.paymentKey,
      conversationKey: conversation.conversationKey,
      personRecordId: conversation.personRecordId,
      provider: 'CASHFREE',
      amount: payment.amount,
      currencyCode: payment.currencyCode,
      status: 'ACTIVE',
      linkUrl: payment.linkUrl,
      purpose: item.name,
      externalPaymentId: payment.externalPaymentId,
      expiresAt: payment.expiresAt,
    });
    await whatsapp.updateConversation(conversation.id, {
      status: 'WAITING_PAYMENT',
      paymentStatus: 'ACTIVE',
      paymentLinkUrl: payment.linkUrl,
      recommendedServiceKey: item.serviceKey,
    });
    await this.sendAndPersist(
      conversation,
      `Your secure payment link for *${item.name}* (${payment.currencyCode} ${payment.amount.toLocaleString('en-IN')}) is:\n${payment.linkUrl}\n\nOnce payment is confirmed, this conversation will update automatically.`,
    );
    return payment;
  }

  private async createCashfreePaymentLink(input: {
    conversation: VylinoWhatsAppConversation;
    amount: number;
    currencyCode: string;
    purpose: string;
  }): Promise<VylinoCashfreePaymentResult> {
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      throw new Error('Cashfree is not configured');

    const paymentKey = `wa_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const production =
      process.env.CASHFREE_ENVIRONMENT?.toLowerCase() === 'production';
    const baseUrl = production
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(`${baseUrl}/links`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-version': process.env.CASHFREE_API_VERSION ?? '2025-01-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'x-idempotency-key': randomUUID(),
      },
      body: JSON.stringify({
        link_id: paymentKey,
        link_amount: input.amount,
        link_currency: input.currencyCode,
        link_purpose: input.purpose,
        link_expiry_time: expiresAt,
        link_auto_reminders: true,
        customer_details: {
          customer_name: input.conversation.displayName,
          customer_phone: input.conversation.waId,
        },
        link_meta: {
          notify_url: process.env.VYLINO_CASHFREE_NOTIFY_URL,
          return_url: process.env.VYLINO_CASHFREE_RETURN_URL,
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = (await response.json()) as {
      cf_link_id?: number | string;
      link_id?: string;
      link_status?: string;
      link_url?: string;
      link_amount?: number;
      link_currency?: string;
      link_expiry_time?: string;
      message?: string;
    };
    if (!response.ok || !payload.link_url || !payload.link_id) {
      throw new Error(
        payload.message ?? `Cashfree request failed: ${response.status}`,
      );
    }

    return {
      externalPaymentId: String(payload.cf_link_id ?? payload.link_id),
      paymentKey: payload.link_id,
      status: payload.link_status ?? 'ACTIVE',
      linkUrl: payload.link_url,
      amount: payload.link_amount ?? input.amount,
      currencyCode: payload.link_currency ?? input.currencyCode,
      expiresAt: payload.link_expiry_time ?? expiresAt,
    };
  }

  verifyCashfreeSignature(
    rawBody: Buffer,
    timestamp?: string,
    signature?: string,
  ) {
    const secret = process.env.CASHFREE_CLIENT_SECRET;
    if (!secret || !timestamp || !signature) return false;
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}${rawBody.toString('utf8')}`)
      .digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(signature);
    return (
      expectedBuffer.length === suppliedBuffer.length &&
      timingSafeEqual(expectedBuffer, suppliedBuffer)
    );
  }

  async handleCashfreeWebhook(payload: unknown) {
    if (!payload || typeof payload !== 'object') return { updated: false };
    const event = payload as {
      type?: string;
      event?: string;
      data?: {
        link_id?: string;
        link_status?: string;
        link?: { link_id?: string; link_status?: string };
        payment?: { payment_status?: string; payment_time?: string };
      };
    };
    const paymentKey = event.data?.link_id ?? event.data?.link?.link_id;
    if (!paymentKey) return { updated: false };

    const { whatsapp } = this.transports;
    const payment = await whatsapp.findPaymentByKey(paymentKey);
    if (!payment) return { updated: false };

    const rawStatus =
      event.data?.link_status ??
      event.data?.link?.link_status ??
      event.data?.payment?.payment_status ??
      event.type ??
      event.event ??
      'ACTIVE';
    const upper = rawStatus.toUpperCase();
    const status =
      upper.includes('PAID') || upper.includes('SUCCESS')
        ? 'PAID'
        : upper.includes('PARTIAL')
          ? 'PARTIALLY_PAID'
          : upper.includes('CANCEL')
            ? 'CANCELLED'
            : upper.includes('EXPIRE')
              ? 'EXPIRED'
              : upper.includes('FAIL')
                ? 'FAILED'
                : 'ACTIVE';

    await whatsapp.updatePaymentRequest(payment.id, {
      status,
      ...(status === 'PAID'
        ? {
            paidAt:
              event.data?.payment?.payment_time ?? new Date().toISOString(),
          }
        : {}),
    });

    if (payment.conversationKey) {
      const conversation = await whatsapp.findConversation(
        payment.conversationKey,
      );
      if (conversation) {
        await whatsapp.updateConversation(conversation.id, {
          paymentStatus: status,
          status: status === 'PAID' ? 'WON' : conversation.status,
        });

        if (
          status === 'PAID' &&
          this.enabled &&
          this.providerService.isConfigured
        ) {
          const windowOpen =
            Boolean(conversation.serviceWindowExpiresAt) &&
            new Date(conversation.serviceWindowExpiresAt as string).getTime() >
              Date.now();
          if (windowOpen) {
            await this.sendAndPersist(
              conversation,
              'Payment received successfully. Thank you! Our team will continue with the next step for your selected service.',
            );
          } else if (process.env.VYLINO_WHATSAPP_PAYMENT_SUCCESS_TEMPLATE) {
            await this.providerService.sendTemplate({
              to: conversation.waId,
              templateName:
                process.env.VYLINO_WHATSAPP_PAYMENT_SUCCESS_TEMPLATE,
              languageCode:
                process.env.VYLINO_WHATSAPP_TEMPLATE_LANGUAGE ?? 'en',
            });
          }
        }
      }
    }

    return { updated: true, paymentKey, status };
  }
}
