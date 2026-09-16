import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const VYLINO_ESTIMATED_VALUE_FIELD_ID =
  'c1c0fa3a-bfc0-47d4-a73c-88ae06eac68d';

export default defineField({
  universalIdentifier: VYLINO_ESTIMATED_VALUE_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'estimatedValue',
  label: 'Estimated Value',
  description: 'Estimated commercial value of the lead in the workspace currency.',
  icon: 'IconCurrencyRupee',
  isNullable: true,
});
