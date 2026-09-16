import { mapLeadCaptureToCrmFields } from '../lead-capture/crm-mapper';
import type { VylinoLeadCapturePayload } from '../lead-capture/types';
import type { TwentyPersonCreateInput } from './types';

const splitName = (fullName?: string) => {
  const value = fullName?.trim();
  if (!value) return {};

  const [firstName, ...rest] = value.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ') || undefined,
  };
};

export const mapLeadToTwentyPersonInput = (
  lead: VylinoLeadCapturePayload,
  companyId?: string,
): TwentyPersonCreateInput => ({
  ...splitName(lead.identity.name),
  email: lead.identity.email,
  phone: lead.identity.phone,
  companyId,
  customFields: mapLeadCaptureToCrmFields(lead),
});
