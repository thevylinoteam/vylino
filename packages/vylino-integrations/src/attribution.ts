import type { VylinoAttribution } from './types';

export type AttributionInput = Record<string, string | null | undefined>;

const clean = (value: string | null | undefined) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
};

export const normalizeAttribution = (
  input: AttributionInput,
): VylinoAttribution => ({
  source: clean(input.utm_source ?? input.source),
  medium: clean(input.utm_medium ?? input.medium),
  campaign: clean(input.utm_campaign ?? input.campaign),
  content: clean(input.utm_content ?? input.content),
  term: clean(input.utm_term ?? input.term),
  landingPage: clean(input.landing_page ?? input.landingPage),
  referrer: clean(input.referrer),
  gclid: clean(input.gclid),
  fbclid: clean(input.fbclid),
});

export const hasPaidAttribution = (attribution: VylinoAttribution) =>
  Boolean(attribution.gclid || attribution.fbclid || attribution.medium === 'cpc');
