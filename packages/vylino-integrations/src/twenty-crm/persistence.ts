import type { VylinoLeadCapturePayload } from '../lead-capture/types';
import { findExistingTwentyPerson } from './deduplication';
import { mapLeadToTwentyPersonInput } from './mapper';
import type { TwentyCrmTransport } from './transport';
import type {
  PersistLeadOptions,
  TwentyLeadPersistenceResult,
} from './types';

const buildOpportunityName = (
  lead: VylinoLeadCapturePayload,
  options?: PersistLeadOptions,
) =>
  options?.opportunityName ??
  [lead.identity.name, lead.serviceInterest].filter(Boolean).join(' — ') ||
  'New Website Lead';

export const persistLeadToTwenty = async (
  transport: TwentyCrmTransport,
  lead: VylinoLeadCapturePayload,
  options?: PersistLeadOptions,
): Promise<TwentyLeadPersistenceResult> => {
  let companyId: string | undefined;
  let companyCreated = false;

  if (options?.companyName?.trim()) {
    const existingCompany = await transport.findCompanyByName(
      options.companyName.trim(),
    );

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const company = await transport.createCompany({
        name: options.companyName.trim(),
      });
      companyId = company.id;
      companyCreated = true;
    }
  }

  const existingPerson = await findExistingTwentyPerson(transport, lead);
  let personId: string;
  let personCreated = false;

  if (existingPerson) {
    personId = existingPerson.id;
    await transport.updatePerson(
      personId,
      mapLeadToTwentyPersonInput(lead, companyId ?? existingPerson.companyId),
    );
  } else {
    const person = await transport.createPerson(
      mapLeadToTwentyPersonInput(lead, companyId),
    );
    personId = person.id;
    personCreated = true;
  }

  let opportunityId: string | undefined;
  let opportunityCreated = false;

  if (options?.createOpportunity) {
    const opportunity = await transport.createOpportunity({
      name: buildOpportunityName(lead, options),
      amount: options.opportunityAmount,
      stage: options.opportunityStage,
      personId,
      companyId,
      sourceLeadId: lead.externalLeadId,
    });

    opportunityId = opportunity.id;
    opportunityCreated = true;
  }

  return {
    personId,
    companyId,
    opportunityId,
    personCreated,
    companyCreated,
    opportunityCreated,
  };
};
