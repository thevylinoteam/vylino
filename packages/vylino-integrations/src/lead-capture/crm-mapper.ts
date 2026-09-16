import { inferLeadSource } from './capture';
import type {
  VylinoCrmLeadFields,
  VylinoLeadCapturePayload,
} from './types';

export const mapLeadCaptureToCrmFields = (
  payload: VylinoLeadCapturePayload,
): VylinoCrmLeadFields => ({
  leadSource: inferLeadSource(payload),
  leadChannel: payload.channel,
  serviceInterest: payload.serviceInterest,
  landingPage: payload.attribution.landingPage ?? payload.sourceUrl,
  referrer: payload.attribution.referrer,
  utmSource: payload.attribution.source,
  utmMedium: payload.attribution.medium,
  utmCampaign: payload.attribution.campaign,
  utmContent: payload.attribution.content,
  utmTerm: payload.attribution.term,
  gclid: payload.attribution.gclid,
  fbclid: payload.attribution.fbclid,
  externalLeadId: payload.externalLeadId,
  firstCapturedAt: payload.capturedAt,
});
