const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

export type BrowserAttributionState = Partial<
  Record<(typeof ATTRIBUTION_KEYS)[number], string>
> & {
  landing_page?: string;
  referrer?: string;
};

export const readAttributionFromUrl = (
  url: string,
  referrer?: string,
): BrowserAttributionState => {
  const parsed = new URL(url);
  const state: BrowserAttributionState = {
    landing_page: parsed.href,
    referrer: referrer || undefined,
  };

  for (const key of ATTRIBUTION_KEYS) {
    const value = parsed.searchParams.get(key)?.trim();
    if (value) state[key] = value;
  }

  return state;
};

export const mergeFirstTouchAttribution = (
  existing: BrowserAttributionState | undefined,
  incoming: BrowserAttributionState,
): BrowserAttributionState => ({
  ...incoming,
  ...existing,
});

export const toElementorHiddenFields = (
  state: BrowserAttributionState,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(state).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    ),
  );

export const VYLINO_BROWSER_ATTRIBUTION_STORAGE_KEY =
  'vylino:first-touch-attribution';
