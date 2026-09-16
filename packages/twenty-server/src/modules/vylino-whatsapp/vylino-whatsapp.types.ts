export type VylinoWhatsAppProvider = 'META_CLOUD' | 'EVOLUTION';
export type VylinoWhatsAppAutomationMode =
  | 'BOT'
  | 'ASSISTED'
  | 'HUMAN'
  | 'PAUSED';
export type VylinoWhatsAppConversationStatus =
  | 'OPEN'
  | 'WAITING_CUSTOMER'
  | 'WAITING_PAYMENT'
  | 'HUMAN_HANDOFF'
  | 'WON'
  | 'CLOSED'
  | 'OPTED_OUT';

export type VylinoNormalizedWhatsAppMessage = {
  provider: VylinoWhatsAppProvider;
  externalMessageId: string;
  waId: string;
  displayName?: string;
  messageType: string;
  text?: string;
  timestamp: string;
};

export type VylinoWhatsAppConversation = {
  id: string;
  conversationKey: string;
  waId: string;
  displayName?: string;
  provider: VylinoWhatsAppProvider;
  status?: VylinoWhatsAppConversationStatus;
  automationMode?: VylinoWhatsAppAutomationMode;
  personRecordId?: string;
  opportunityRecordId?: string;
  lastInboundAt?: string;
  lastOutboundAt?: string;
  serviceWindowExpiresAt?: string;
  lastIntent?: string;
  lastIntentConfidence?: number;
  recommendedServiceKey?: string;
  paymentStatus?: string;
  paymentLinkUrl?: string;
  humanOwner?: string;
  unreadCount?: number;
  totalMessages?: number;
  lastMessageText?: string;
};

export type VylinoServiceCatalogItem = {
  id: string;
  serviceKey: string;
  name: string;
  category?: string;
  shortDescription?: string;
  basePrice?: number;
  currencyCode?: string;
  isActive?: boolean;
  keywords?: string;
  paymentRequired?: boolean;
  priority?: number;
};

export type VylinoPaymentRequest = {
  id: string;
  paymentKey: string;
  conversationKey?: string;
  personRecordId?: string;
  provider?: string;
  amount?: number;
  currencyCode?: string;
  status?: string;
  linkUrl?: string;
  purpose?: string;
  externalPaymentId?: string;
  paidAt?: string;
  expiresAt?: string;
};

export type VylinoIntent =
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

export type VylinoIntentResult = {
  intent: VylinoIntent;
  confidence: number;
  matchedTerms: string[];
};

export type VylinoServiceRecommendation = {
  item: VylinoServiceCatalogItem;
  score: number;
  matchedTerms: string[];
};

export type VylinoWhatsAppSendResult = {
  messageId: string;
  acceptedAt: string;
};

export type VylinoWhatsAppWebhookResult = {
  processed: number;
  duplicates: number;
  replied: number;
  handoffs: number;
  optedOut: number;
  paymentLinks: number;
};

export type VylinoCashfreePaymentResult = {
  externalPaymentId: string;
  paymentKey: string;
  status: string;
  linkUrl: string;
  amount: number;
  currencyCode: string;
  expiresAt?: string;
};
