import type { VylinoLeadCapturePayload } from '../lead-capture/types';
import type { TwentyCrmTransport } from './transport';
import type { TwentyPersonRecord } from './types';

const clean = (value: string | undefined) => value?.trim() || undefined;

export const findExistingTwentyPerson = async (
  transport: TwentyCrmTransport,
  lead: VylinoLeadCapturePayload,
): Promise<TwentyPersonRecord | undefined> => {
  const email = clean(lead.identity.email)?.toLowerCase();
  if (email) {
    const byEmail = await transport.findPersonByEmail(email);
    if (byEmail) return byEmail;
  }

  const phone = clean(lead.identity.phone);
  if (phone) {
    const byPhone = await transport.findPersonByPhone(phone);
    if (byPhone) return byPhone;
  }

  return undefined;
};
