export type WhatsAppTransportProvider = 'META_CLOUD' | 'EVOLUTION';

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';

export type WhatsAppAutomationMode = 'BOT' | 'ASSISTED' | 'HUMAN' | 'PAUSED';

export type WhatsAppNormalizedMessage = {
  provider: WhatsAppTransportProvider;
  externalMessageId: string;
  waId: string;
  displayName?: string;
  direction: WhatsAppMessageDirection;
  messageType: string;
  text?: string;
  timestamp: string;
  replyToMessageId?: string;
};

export type WhatsAppSendTextInput = {
  to: string;
  text: string;
  previewUrl?: boolean;
};

export type WhatsAppSendTemplateInput = {
  to: string;
  templateName: string;
  languageCode: string;
  components?: unknown[];
};

export type WhatsAppSendResult = {
  provider: WhatsAppTransportProvider;
  messageId: string;
  acceptedAt: string;
};

export interface WhatsAppTransport {
  provider: WhatsAppTransportProvider;
  sendText(input: WhatsAppSendTextInput): Promise<WhatsAppSendResult>;
  sendTemplate(input: WhatsAppSendTemplateInput): Promise<WhatsAppSendResult>;
}

export type ServiceCatalogItem = {
  serviceKey: string;
  name: string;
  category?: string;
  shortDescription?: string;
  basePrice?: number;
  currencyCode?: string;
  isActive: boolean;
  keywords?: string;
  paymentRequired?: boolean;
  priority?: number;
};

export type WhatsAppIntent =
  | 'GREETING'
  | 'WEBSITE_DEVELOPMENT'
  | 'ECOMMERCE'
  | 'SEO'
  | 'DIGITAL_MARKETING'
  | 'ADS'
  | 'PRICE'
  | 'PAYMENT'
  | 'SUPPORT'
  | 'HUMAN'
  | 'OPT_OUT'
  | 'UNKNOWN';

export type IntentResult = {
  intent: WhatsAppIntent;
  confidence: number;
  matchedTerms: string[];
};

export type ServiceRecommendation = {
  item: ServiceCatalogItem;
  score: number;
  matchedTerms: string[];
};

export type AutomationDecision = {
  shouldReply: boolean;
  requiresHuman: boolean;
  optedOut: boolean;
  reason:
    | 'AUTO_REPLY'
    | 'AUTOMATION_DISABLED'
    | 'OUTSIDE_SERVICE_WINDOW'
    | 'LOW_CONFIDENCE'
    | 'HUMAN_REQUESTED'
    | 'OPT_OUT'
    | 'UNSUPPORTED';
};

export type PaymentLinkRequest = {
  paymentKey: string;
  amount: number;
  currencyCode: string;
  purpose: string;
  customer: {
    name?: string;
    phone: string;
    email?: string;
  };
  expiresAt?: string;
  notifyUrl?: string;
  returnUrl?: string;
};

export type PaymentLinkResult = {
  provider: 'CASHFREE';
  externalPaymentId: string;
  paymentKey: string;
  status: string;
  linkUrl: string;
  amount: number;
  currencyCode: string;
  expiresAt?: string;
};
