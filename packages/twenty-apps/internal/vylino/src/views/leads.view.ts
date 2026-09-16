import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';
import { VYLINO_ESTIMATED_VALUE_FIELD_ID } from '../fields/estimated-value.field';
import { VYLINO_LEAD_SCORE_FIELD_ID } from '../fields/lead-score.field';
import { VYLINO_NEXT_FOLLOW_UP_FIELD_ID } from '../fields/next-follow-up.field';

export const VYLINO_LEADS_VIEW_ID = '12178bbf-b263-4210-9052-7741192b77e6';

const personFields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields;
const LEAD_SOURCE_FIELD_ID = '82d058eb-b032-4432-9de3-cd195501f513';
const SERVICE_INTEREST_FIELD_ID = 'e134d7bb-9cb7-424a-9c53-e1dc61441547';

export default defineView({
  universalIdentifier: VYLINO_LEADS_VIEW_ID,
  name: 'Vylino Leads',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconUsersGroup',
  position: 1,
  fields: [
    {
      universalIdentifier: 'b92db55f-198f-4de4-899b-5ca30fc8bdc8',
      fieldMetadataUniversalIdentifier: personFields.name.universalIdentifier,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'fe45666a-6036-48c3-967a-87d68466a61b',
      fieldMetadataUniversalIdentifier: personFields.emails.universalIdentifier,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e9b61153-67d1-487d-950b-ae7802a3c43c',
      fieldMetadataUniversalIdentifier: personFields.phones.universalIdentifier,
      position: 2,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: '94309bee-470b-433a-b5d8-c4154f763c30',
      fieldMetadataUniversalIdentifier: LEAD_SOURCE_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '1bdd7e32-0497-4717-beb9-0d33841f8b78',
      fieldMetadataUniversalIdentifier: SERVICE_INTEREST_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 190,
    },
    {
      universalIdentifier: 'c77f1aee-a875-4fb1-83f8-ebbf2b92762b',
      fieldMetadataUniversalIdentifier: VYLINO_LEAD_SCORE_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier: '32c0449f-ec68-4077-ab2d-49f5cb146a88',
      fieldMetadataUniversalIdentifier: VYLINO_ESTIMATED_VALUE_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'ac633fff-0859-48ad-aa66-59812ef36cae',
      fieldMetadataUniversalIdentifier: VYLINO_NEXT_FOLLOW_UP_FIELD_ID,
      position: 7,
      isVisible: true,
      size: 170,
    },
  ],
  filters: [
    {
      universalIdentifier: '9dba1fd3-f7c3-48cc-b400-f2c5bea4955c',
      fieldMetadataUniversalIdentifier: LEAD_SOURCE_FIELD_ID,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
