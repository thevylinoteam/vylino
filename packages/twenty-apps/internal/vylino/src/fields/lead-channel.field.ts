import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '580af541-b442-4950-8b73-6c97923832ff',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'leadChannel',
  label: 'Lead Channel',
  description: 'Channel used to submit or capture the lead.',
  icon: 'IconRoute',
  isNullable: true,
});
