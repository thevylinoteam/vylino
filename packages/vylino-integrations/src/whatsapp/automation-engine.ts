import { classifyWhatsAppIntent } from './intent-engine';
import { recommendServices } from './recommender';
import { decideWhatsAppAutomation } from './rules';
import type {
  AutomationDecision,
  ServiceCatalogItem,
  ServiceRecommendation,
  WhatsAppAutomationMode,
  WhatsAppIntent,
} from './types';

export type WhatsAppAutomationInput = {
  messageText: string;
  mode: WhatsAppAutomationMode;
  lastInboundAt?: string;
  catalog: ServiceCatalogItem[];
  customerName?: string;
};

export type WhatsAppAutomationOutput = {
  intent: WhatsAppIntent;
  confidence: number;
  decision: AutomationDecision;
  recommendations: ServiceRecommendation[];
  replyText?: string;
};

const formatPrice = (item: ServiceCatalogItem): string => {
  if (typeof item.basePrice !== 'number') return '';
  return ` — ${item.currencyCode ?? 'INR'} ${item.basePrice.toLocaleString('en-IN')}`;
};

const buildRecommendationReply = (
  name: string | undefined,
  recommendations: ServiceRecommendation[],
): string => {
  const greeting = name ? `Hi ${name}, ` : 'Hi, ';
  if (recommendations.length === 0) {
    return `${greeting}I can help with website development, ecommerce, SEO, digital marketing and advertising. Please tell me what you want to achieve, your business type and approximate budget.`;
  }

  const lines = recommendations.map(
    ({ item }, index) =>
      `${index + 1}. *${item.name}*${formatPrice(item)}${item.shortDescription ? `\n   ${item.shortDescription}` : ''}`,
  );

  return `${greeting}based on your requirement, these options fit best:\n\n${lines.join('\n\n')}\n\nReply with the option number/name, or type *human* if you want to speak with our team.`;
};

export const runWhatsAppAutomation = (
  input: WhatsAppAutomationInput,
): WhatsAppAutomationOutput => {
  const intentResult = classifyWhatsAppIntent(input.messageText);
  const decision = decideWhatsAppAutomation({
    mode: input.mode,
    intent: intentResult,
    lastInboundAt: input.lastInboundAt,
  });
  const recommendations = recommendServices(
    input.catalog,
    intentResult,
    input.messageText,
  );

  if (!decision.shouldReply) {
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      decision,
      recommendations,
    };
  }

  if (decision.optedOut) {
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      decision,
      recommendations: [],
      replyText:
        'You have been opted out of automated WhatsApp messages. If you need help later, just message us again.',
    };
  }

  if (decision.requiresHuman) {
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      decision,
      recommendations,
      replyText:
        'I’m transferring this conversation to a team member. They can continue from the context already shared here.',
    };
  }

  if (intentResult.intent === 'PAYMENT') {
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      decision,
      recommendations,
      replyText:
        'I can prepare a secure payment link. Please confirm the selected service and amount, and I’ll generate the link for you.',
    };
  }

  if (intentResult.intent === 'GREETING') {
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      decision,
      recommendations,
      replyText:
        `Hi${input.customerName ? ` ${input.customerName}` : ''}! Welcome to Vylino. I can help with website development, ecommerce, SEO, digital marketing, Google/Meta Ads, pricing and support. What would you like help with?`,
    };
  }

  return {
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    decision,
    recommendations,
    replyText: buildRecommendationReply(input.customerName, recommendations),
  };
};
