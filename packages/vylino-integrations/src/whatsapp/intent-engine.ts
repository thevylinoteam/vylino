import type { IntentResult, WhatsAppIntent } from './types';

const INTENT_TERMS: Record<WhatsAppIntent, string[]> = {
  GREETING: ['hi', 'hello', 'hey', 'namaste', 'hii'],
  WEBSITE_DEVELOPMENT: [
    'website',
    'web site',
    'wordpress',
    'business website',
    'landing page',
    'redesign',
  ],
  ECOMMERCE: ['ecommerce', 'e-commerce', 'online store', 'shopify', 'woocommerce', 'store website'],
  SEO: ['seo', 'ranking', 'google ranking', 'organic traffic', 'search engine'],
  DIGITAL_MARKETING: ['digital marketing', 'marketing service', 'social media marketing', 'online marketing'],
  ADS: ['google ads', 'meta ads', 'facebook ads', 'instagram ads', 'ppc', 'paid ads', 'advertising'],
  PRICE: ['price', 'pricing', 'cost', 'charges', 'rate', 'budget', 'quotation', 'quote'],
  PAYMENT: ['payment', 'pay now', 'payment link', 'upi', 'paid', 'invoice'],
  SUPPORT: ['support', 'problem', 'issue', 'not working', 'complaint', 'refund', 'help me'],
  HUMAN: ['human', 'agent', 'person', 'executive', 'call me', 'talk to someone'],
  OPT_OUT: ['stop', 'unsubscribe', 'cancel messages', 'do not message', "don't message", 'opt out'],
  UNKNOWN: [],
};

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

export const classifyWhatsAppIntent = (text: string): IntentResult => {
  const normalized = normalize(text);
  let bestIntent: WhatsAppIntent = 'UNKNOWN';
  let bestMatches: string[] = [];

  for (const [intent, terms] of Object.entries(INTENT_TERMS) as [WhatsAppIntent, string[]][]) {
    if (intent === 'UNKNOWN') continue;
    const matches = terms.filter((term) => normalized.includes(term));
    if (matches.length > bestMatches.length) {
      bestIntent = intent;
      bestMatches = matches;
    }
  }

  if (bestIntent === 'UNKNOWN') {
    return { intent: 'UNKNOWN', confidence: 0.25, matchedTerms: [] };
  }

  const confidence = Math.min(0.98, 0.62 + bestMatches.length * 0.12);
  return { intent: bestIntent, confidence, matchedTerms: bestMatches };
};
