import type { AttributionInput } from '../attribution';

const TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

export const extractAttributionFromUrl = (
  url: string,
  referrer?: string,
): AttributionInput => {
  const parsed = new URL(url);
  const attribution: AttributionInput = {
    landing_page: `${parsed.origin}${parsed.pathname}${parsed.search}`,
    referrer,
  };

  for (const key of TRACKING_KEYS) {
    const value = parsed.searchParams.get(key);
    if (value) attribution[key] = value;
  }

  return attribution;
};

export const mergeAttributionInputs = (
  primary: AttributionInput,
  fallback: AttributionInput,
): AttributionInput => ({
  ...fallback,
  ...Object.fromEntries(
    Object.entries(primary).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ),
});
