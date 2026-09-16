import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const VYLINO_NEXT_FOLLOW_UP_FIELD_ID =
  '8e8591e7-42b8-4bf4-a41f-27e9d94785eb';

export default defineField({
  universalIdentifier: VYLINO_NEXT_FOLLOW_UP_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'nextFollowUpAt',
  label: 'Next Follow-up',
  description: 'Next planned sales follow-up for this lead.',
  icon: 'IconCalendarTime',
  isNullable: true,
});
