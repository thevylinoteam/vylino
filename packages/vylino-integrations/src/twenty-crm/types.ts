import type { VylinoLeadCapturePayload } from '../lead-capture/types';
import type { VylinoCrmLeadFields } from '../lead-capture/types';

export type TwentyPersonRecord = {
  id: string;
  email?: string;
  phone?: string;
  companyId?: string;
};

export type TwentyCompanyRecord = {
  id: string;
  name?: string;
};

export type TwentyOpportunityRecord = {
  id: string;
  name?: string;
  amount?: number;
  stage?: string;
  personId?: string;
  companyId?: string;
};

export type TwentyPersonCreateInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyId?: string;
  customFields?: VylinoCrmLeadFields;
};

export type TwentyCompanyCreateInput = {
  name: string;
  domainName?: string;
};

export type TwentyOpportunityCreateInput = {
  name: string;
  amount?: number;
  stage?: string;
  personId?: string;
  companyId?: string;
  sourceLeadId?: string;
};

export type TwentyLeadPersistenceResult = {
  personId: string;
  companyId?: string;
  opportunityId?: string;
  personCreated: boolean;
  companyCreated: boolean;
  opportunityCreated: boolean;
};

export type PersistLeadOptions = {
  createOpportunity?: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  opportunityStage?: string;
  companyName?: string;
};

export type TwentyLeadPersistenceInput = {
  lead: VylinoLeadCapturePayload;
  options?: PersistLeadOptions;
};
