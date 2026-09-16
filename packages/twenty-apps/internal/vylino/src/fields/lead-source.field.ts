import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '82d058eb-b032-4432-9de3-cd195501f513',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'leadSource',
  label: 'Lead Source',
  description: 'Normalized acquisition source for this lead.',
  icon: 'IconSourceCode',
  isNullable: true,
});
