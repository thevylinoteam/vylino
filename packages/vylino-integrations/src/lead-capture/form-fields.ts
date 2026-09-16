import type { VylinoCrmLeadFields } from './types';

export const LEAD_ATTRIBUTION_FORM_FIELD_NAMES: Array<keyof VylinoCrmLeadFields> = [
  'leadSource',
  'leadChannel',
  'landingPage',
  'referrer',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
  'gclid',
  'fbclid',
  'externalLeadId',
  'firstCapturedAt',
];

export const toHiddenFormFields = (
  fields: VylinoCrmLeadFields,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );
