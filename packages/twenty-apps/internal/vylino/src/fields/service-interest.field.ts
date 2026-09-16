import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'e134d7bb-9cb7-424a-9c53-e1dc61441547',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'serviceInterest',
  label: 'Service Interest',
  description: 'Vylino service the lead is interested in.',
  icon: 'IconBriefcase',
  isNullable: true,
});
