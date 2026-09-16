import { defineObject, FieldType } from 'twenty-sdk/define';

export const VYLINO_SERVICE_CATALOG_OBJECT_ID =
  '2cdea49c-59f9-4a33-afb7-1eba5c9f2c3c';
export const VYLINO_SERVICE_KEY_FIELD_ID =
  'a8272f85-a4d7-4dcf-8915-d0d4b192bde5';
export const VYLINO_SERVICE_NAME_FIELD_ID =
  '2fc9821c-83d8-4f8b-88da-28f664a032c4';
export const VYLINO_SERVICE_CATEGORY_FIELD_ID =
  'e3228c45-5b86-443e-a221-66af6116b844';
export const VYLINO_SERVICE_DESCRIPTION_FIELD_ID =
  '872cce76-f4a5-4a6d-9554-e4cbb8ef2d3e';
export const VYLINO_SERVICE_PRICE_FIELD_ID =
  '4cddf4dc-ec4a-4ba6-8958-0a224e83163b';
export const VYLINO_SERVICE_CURRENCY_FIELD_ID =
  'f666ec0e-10e1-4bf7-b052-5f44e5a40ec8';
export const VYLINO_SERVICE_ACTIVE_FIELD_ID =
  '30e111c2-79f1-4ab4-9aa4-d0fae53f84ee';
export const VYLINO_SERVICE_KEYWORDS_FIELD_ID =
  '41de4997-0cdc-415a-a48f-6be6de1d619e';
export const VYLINO_SERVICE_PAYMENT_REQUIRED_FIELD_ID =
  'ebbf892a-1c4f-45d8-abfc-f8945b276e89';
export const VYLINO_SERVICE_PRIORITY_FIELD_ID =
  'fd746858-0c25-4e6e-a352-3845a671ab2d';

export default defineObject({
  universalIdentifier: VYLINO_SERVICE_CATALOG_OBJECT_ID,
  nameSingular: 'vylinoServiceCatalogItem',
  namePlural: 'vylinoServiceCatalogItems',
  labelSingular: 'Service Catalog Item',
  labelPlural: 'Service Catalog',
  description: 'Products and services available to the WhatsApp recommendation engine.',
  icon: 'IconPackages',
  labelIdentifierFieldMetadataUniversalIdentifier: VYLINO_SERVICE_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: VYLINO_SERVICE_KEY_FIELD_ID, type: FieldType.TEXT, name: 'serviceKey', label: 'Service Key', icon: 'IconKey', isUnique: true },
    { universalIdentifier: VYLINO_SERVICE_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconPackage' },
    { universalIdentifier: VYLINO_SERVICE_CATEGORY_FIELD_ID, type: FieldType.TEXT, name: 'category', label: 'Category', icon: 'IconCategory', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_DESCRIPTION_FIELD_ID, type: FieldType.TEXT, name: 'shortDescription', label: 'Description', icon: 'IconFileDescription', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_PRICE_FIELD_ID, type: FieldType.NUMBER, name: 'basePrice', label: 'Base Price', icon: 'IconCurrencyRupee', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_CURRENCY_FIELD_ID, type: FieldType.TEXT, name: 'currencyCode', label: 'Currency', icon: 'IconCash', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_ACTIVE_FIELD_ID, type: FieldType.BOOLEAN, name: 'isActive', label: 'Active', icon: 'IconToggleRight', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_KEYWORDS_FIELD_ID, type: FieldType.TEXT, name: 'keywords', label: 'Keywords', description: 'Comma-separated phrases used by the deterministic recommendation engine.', icon: 'IconTags', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_PAYMENT_REQUIRED_FIELD_ID, type: FieldType.BOOLEAN, name: 'paymentRequired', label: 'Payment Required', icon: 'IconCreditCard', isNullable: true },
    { universalIdentifier: VYLINO_SERVICE_PRIORITY_FIELD_ID, type: FieldType.NUMBER, name: 'priority', label: 'Priority', icon: 'IconSortDescending', isNullable: true },
  ],
});
