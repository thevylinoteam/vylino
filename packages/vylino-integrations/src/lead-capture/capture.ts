import { normalizeAttribution } from '../attribution';
import type { AttributionInput } from '../attribution';
import type {
  VylinoLeadCaptureChannel,
  VylinoLeadCapturePayload,
  VylinoLeadIdentity,
} from './types';

export type VylinoLeadCaptureInput = AttributionInput & {
  channel: VylinoLeadCaptureChannel;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  serviceInterest?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  externalLeadId?: string | null;
  rawSource?: string | null;
  capturedAt?: string;
};

const clean = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeIdentity = (input: VylinoLeadCaptureInput): VylinoLeadIdentity => ({
  name: clean(input.name),
  email: clean(input.email)?.toLowerCase(),
  phone: clean(input.phone),
});

export const normalizeLeadCapture = (
  input: VylinoLeadCaptureInput,
): VylinoLeadCapturePayload => ({
  capturedAt: input.capturedAt ?? new Date().toISOString(),
  channel: input.channel,
  identity: normalizeIdentity(input),
  serviceInterest: clean(input.serviceInterest),
  message: clean(input.message),
  attribution: normalizeAttribution(input),
  sourceUrl: clean(input.sourceUrl),
  externalLeadId: clean(input.externalLeadId),
  rawSource: clean(input.rawSource),
});

export const inferLeadSource = (
  payload: VylinoLeadCapturePayload,
): string => {
  if (payload.attribution.gclid) return 'google_ads';
  if (payload.attribution.fbclid) return 'meta_ads';
  if (payload.attribution.source) return payload.attribution.source;
  if (payload.channel === 'whatsapp') return 'whatsapp';
  if (payload.channel === 'website_form') return 'website';
  return payload.channel;
};
