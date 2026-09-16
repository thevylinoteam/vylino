import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
} from 'twenty-sdk/define';

import {
  VYLINO_SALES_STAGE_FIELD_ID,
  VYLINO_SALES_STAGE_OPTIONS,
} from '../fields/opportunity-sales-stage.field';

export const VYLINO_SALES_PIPELINE_VIEW_ID =
  '770e2998-25ed-4757-82e0-1e32b21e7902';

const opportunityFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;

const GROUP_IDS = [
  'bdf04414-c5d4-434a-aa0a-06aa8cc785da',
  'a9ff08da-ea47-4785-bac8-4367866df355',
  '83f08d8f-4139-4b84-8d6a-49e3073a88e5',
  '61104003-eea3-4336-aadf-a59b09a73167',
  'f2f7e98b-3493-4471-b987-ab51abb9dcb6',
  'eb7bd1e7-a1a6-4105-9693-22404544ba62',
  'cfa78cb1-f56c-426f-a860-57e465238566',
  '6af5477b-5476-4e0f-b6a2-6b4fd902b345',
];

export default defineView({
  universalIdentifier: VYLINO_SALES_PIPELINE_VIEW_ID,
  name: 'Vylino Sales Pipeline',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: VYLINO_SALES_STAGE_FIELD_ID,
  fields: [
    {
      universalIdentifier: '2686cff2-290c-4dd2-bba2-fb083aa13fc4',
      fieldMetadataUniversalIdentifier: opportunityFields.name.universalIdentifier,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '86ae010e-f827-43da-bfbd-cce39cb1193a',
      fieldMetadataUniversalIdentifier: VYLINO_SALES_STAGE_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'c626558e-da36-4572-bf1f-a6ef290b7bf0',
      fieldMetadataUniversalIdentifier: opportunityFields.amount.universalIdentifier,
      position: 2,
      isVisible: true,
      size: 150,
    },
  ],
  groups: VYLINO_SALES_STAGE_OPTIONS.map((option, index) => ({
    universalIdentifier: GROUP_IDS[index],
    fieldValue: option.value,
    position: index,
    isVisible: true,
  })),
});
