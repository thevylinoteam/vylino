import type {
  IntentResult,
  ServiceCatalogItem,
  ServiceRecommendation,
} from './types';

const intentHints: Record<string, string[]> = {
  WEBSITE_DEVELOPMENT: ['website', 'wordpress', 'business website', 'landing page', 'redesign'],
  ECOMMERCE: ['ecommerce', 'shopify', 'woocommerce', 'online store'],
  SEO: ['seo', 'ranking', 'organic', 'search engine'],
  DIGITAL_MARKETING: ['digital marketing', 'social media', 'marketing'],
  ADS: ['google ads', 'meta ads', 'facebook ads', 'instagram ads', 'ppc'],
};

const words = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .split(/[;,|]/)
    .map((term) => term.trim())
    .filter(Boolean);

export const recommendServices = (
  catalog: ServiceCatalogItem[],
  intent: IntentResult,
  customerText: string,
  limit = 3,
): ServiceRecommendation[] => {
  const normalizedText = customerText.toLowerCase();
  const hints = intentHints[intent.intent] ?? [];

  return catalog
    .filter((item) => item.isActive)
    .map((item) => {
      const terms = new Set([
        ...words(item.keywords),
        ...words(item.category),
        ...hints,
      ]);
      const matchedTerms = [...terms].filter((term) => normalizedText.includes(term));
      const intentBoost = hints.some((hint) =>
        `${item.name} ${item.category ?? ''} ${item.keywords ?? ''}`
          .toLowerCase()
          .includes(hint),
      )
        ? 4
        : 0;
      const priceBoost = typeof item.basePrice === 'number' ? 0.25 : 0;
      const score = matchedTerms.length * 2 + intentBoost + priceBoost + (item.priority ?? 0) / 100;

      return { item, score, matchedTerms };
    })
    .filter((recommendation) => recommendation.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
