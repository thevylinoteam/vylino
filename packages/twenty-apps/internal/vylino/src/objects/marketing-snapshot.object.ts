import { defineObject, FieldType } from 'twenty-sdk/define';

export enum VylinoMarketingProvider {
  ALL = 'ALL',
  GOOGLE_ADS = 'GOOGLE_ADS',
  META_ADS = 'META_ADS',
  ORGANIC = 'ORGANIC',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

export enum VylinoMarketingPeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  MONTH_TO_DATE = 'MONTH_TO_DATE',
  ALL_TIME = 'ALL_TIME',
  DAILY = 'DAILY',
  CUSTOM = 'CUSTOM',
}

export enum VylinoMarketingScope {
  ACCOUNT = 'ACCOUNT',
  CAMPAIGN = 'CAMPAIGN',
}

export const VYLINO_MARKETING_SNAPSHOT_OBJECT_ID =
  '3568b340-0a92-4fae-a321-d23caf080e26';
export const VYLINO_MARKETING_SNAPSHOT_KEY_FIELD_ID =
  'd03a78ce-7e5a-45f1-84f8-4be93ba4be7b';
export const VYLINO_MARKETING_PROVIDER_FIELD_ID =
  '7fb330f0-f9cd-4223-a66b-c44eef1020c9';
export const VYLINO_MARKETING_PERIOD_FIELD_ID =
  '9a223e19-c714-4f53-b521-fa3979a737e8';
export const VYLINO_MARKETING_SCOPE_FIELD_ID =
  '52dba42c-92dd-4d72-add9-579959dd53ff';
export const VYLINO_MARKETING_PERIOD_START_FIELD_ID =
  '6834d019-c6fb-4e2b-9b71-187a1dbc33a4';
export const VYLINO_MARKETING_PERIOD_END_FIELD_ID =
  'f5a86fe6-44e2-4882-b13f-e74af2c02731';
export const VYLINO_MARKETING_CAMPAIGN_ID_FIELD_ID =
  '9e0381a1-2c08-44d6-9f75-b90ea0c0c75b';
export const VYLINO_MARKETING_CAMPAIGN_NAME_FIELD_ID =
  '3df54dc0-b62c-4a80-88be-8180db3d5830';
export const VYLINO_MARKETING_CURRENCY_FIELD_ID =
  '5719298d-d38e-4113-9da8-ef6a76067c64';
export const VYLINO_MARKETING_SPEND_FIELD_ID =
  '96a07f5b-3007-49bf-926e-43dac53b1a37';
export const VYLINO_MARKETING_IMPRESSIONS_FIELD_ID =
  'bf2fda01-e564-41cb-9e08-6b184c55fdc0';
export const VYLINO_MARKETING_CLICKS_FIELD_ID =
  'e2e3a083-d4f9-41cf-aba3-fcfe28b2daa0';
export const VYLINO_MARKETING_LEADS_FIELD_ID =
  '5133219c-1cab-40e3-8642-a7491044e708';
export const VYLINO_MARKETING_QUALIFIED_LEADS_FIELD_ID =
  '6f29e9d8-b9ac-4d36-ae4c-1394d38c00d7';
export const VYLINO_MARKETING_CUSTOMERS_FIELD_ID =
  '41d4da3f-fa46-41fa-b8de-70ea8d8afed5';
export const VYLINO_MARKETING_REVENUE_FIELD_ID =
  '7b4ccbd2-437a-4698-8429-33aa74986871';
export const VYLINO_MARKETING_CPL_FIELD_ID =
  'c37e88ea-ba24-4b73-9c5d-94dae84b0b4a';
export const VYLINO_MARKETING_CAC_FIELD_ID =
  'bce83bf5-e273-4a11-b102-bb6c6e47e752';
export const VYLINO_MARKETING_ROAS_FIELD_ID =
  '7de5c371-43ee-4fef-9ce5-ecaccb72ba9a';
export const VYLINO_MARKETING_CTR_FIELD_ID =
  '0c87967a-a18e-457f-8b31-1b0f341f9f12';
export const VYLINO_MARKETING_LEAD_TO_CUSTOMER_FIELD_ID =
  '5aea6cb8-0c53-4bfd-b5e6-87b8482a112a';
export const VYLINO_MARKETING_SYNCED_AT_FIELD_ID =
  'dcb3eab6-4016-4049-b336-399d337cbd67';

export default defineObject({
  universalIdentifier: VYLINO_MARKETING_SNAPSHOT_OBJECT_ID,
  nameSingular: 'vylinoMarketingSnapshot',
  namePlural: 'vylinoMarketingSnapshots',
  labelSingular: 'Marketing Snapshot',
  labelPlural: 'Marketing Snapshots',
  description:
    'Normalized marketing performance snapshots used by the Vylino Business OS dashboard.',
  icon: 'IconChartBar',
  labelIdentifierFieldMetadataUniversalIdentifier:
    VYLINO_MARKETING_SNAPSHOT_KEY_FIELD_ID,
  fields: [
    {
      universalIdentifier: VYLINO_MARKETING_SNAPSHOT_KEY_FIELD_ID,
      type: FieldType.TEXT,
      name: 'snapshotKey',
      label: 'Snapshot Key',
      description: 'Stable key used to upsert a provider, scope and period snapshot.',
      icon: 'IconKey',
      isUnique: true,
    },
    {
      universalIdentifier: VYLINO_MARKETING_PROVIDER_FIELD_ID,
      type: FieldType.SELECT,
      name: 'provider',
      label: 'Provider',
      icon: 'IconAffiliate',
      options: [
        { id: 'e9dcb1b3-d891-4401-8372-e7b9eb4493ce', value: VylinoMarketingProvider.ALL, label: 'All', position: 0, color: 'gray' },
        { id: '1b03040f-c92e-4e5d-8fdb-3fd396c784ac', value: VylinoMarketingProvider.GOOGLE_ADS, label: 'Google Ads', position: 1, color: 'blue' },
        { id: 'f5de8a1f-c9ed-42be-95c5-b6bb00a46e73', value: VylinoMarketingProvider.META_ADS, label: 'Meta Ads', position: 2, color: 'purple' },
        { id: '53adb742-498f-453b-afc8-fe7095661f1f', value: VylinoMarketingProvider.ORGANIC, label: 'Organic', position: 3, color: 'green' },
        { id: '2bded716-40b1-4eb3-8f52-da7448d803a4', value: VylinoMarketingProvider.SOCIAL, label: 'Social', position: 4, color: 'cyan' },
        { id: '6a7027c5-9db2-4e3e-967d-a41375e9e4c8', value: VylinoMarketingProvider.OTHER, label: 'Other', position: 5, color: 'yellow' },
      ],
    },
    {
      universalIdentifier: VYLINO_MARKETING_PERIOD_FIELD_ID,
      type: FieldType.SELECT,
      name: 'period',
      label: 'Period',
      icon: 'IconCalendarStats',
      options: [
        { id: '7ad4a5b2-93b0-4933-8aeb-a33d4cb4e870', value: VylinoMarketingPeriod.LAST_7_DAYS, label: 'Last 7 days', position: 0, color: 'blue' },
        { id: '7361ca40-774e-4f73-8aea-45300ec06075', value: VylinoMarketingPeriod.LAST_30_DAYS, label: 'Last 30 days', position: 1, color: 'cyan' },
        { id: '7c576392-524d-4648-af9a-f927fdf1a420', value: VylinoMarketingPeriod.MONTH_TO_DATE, label: 'Month to date', position: 2, color: 'purple' },
        { id: 'b8dff438-abc4-40cf-b80e-645a059b3609', value: VylinoMarketingPeriod.ALL_TIME, label: 'All time', position: 3, color: 'green' },
        { id: 'c6de0add-0337-4f20-b771-f0d8062ceea1', value: VylinoMarketingPeriod.DAILY, label: 'Daily', position: 4, color: 'gray' },
        { id: 'a2ba02ce-317f-4e94-abe3-29a5361a6212', value: VylinoMarketingPeriod.CUSTOM, label: 'Custom', position: 5, color: 'yellow' },
      ],
    },
    {
      universalIdentifier: VYLINO_MARKETING_SCOPE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'scope',
      label: 'Scope',
      icon: 'IconTargetArrow',
      options: [
        { id: '3786deb2-1d7f-4fc9-9462-647faeae4396', value: VylinoMarketingScope.ACCOUNT, label: 'Account', position: 0, color: 'blue' },
        { id: '49521d2c-c6e9-4c89-abb0-b9ce25733c42', value: VylinoMarketingScope.CAMPAIGN, label: 'Campaign', position: 1, color: 'purple' },
      ],
    },
    { universalIdentifier: VYLINO_MARKETING_PERIOD_START_FIELD_ID, type: FieldType.DATE_TIME, name: 'periodStart', label: 'Period Start', icon: 'IconCalendar', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_PERIOD_END_FIELD_ID, type: FieldType.DATE_TIME, name: 'periodEnd', label: 'Period End', icon: 'IconCalendar', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CAMPAIGN_ID_FIELD_ID, type: FieldType.TEXT, name: 'externalCampaignId', label: 'External Campaign ID', icon: 'IconHash', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CAMPAIGN_NAME_FIELD_ID, type: FieldType.TEXT, name: 'campaignName', label: 'Campaign', icon: 'IconSpeakerphone', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CURRENCY_FIELD_ID, type: FieldType.TEXT, name: 'currencyCode', label: 'Currency', icon: 'IconCurrencyRupee', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_SPEND_FIELD_ID, type: FieldType.NUMBER, name: 'spend', label: 'Spend', icon: 'IconCash', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_IMPRESSIONS_FIELD_ID, type: FieldType.NUMBER, name: 'impressions', label: 'Impressions', icon: 'IconEye', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CLICKS_FIELD_ID, type: FieldType.NUMBER, name: 'clicks', label: 'Clicks', icon: 'IconClick', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_LEADS_FIELD_ID, type: FieldType.NUMBER, name: 'leads', label: 'Leads', icon: 'IconUserPlus', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_QUALIFIED_LEADS_FIELD_ID, type: FieldType.NUMBER, name: 'qualifiedLeads', label: 'Qualified Leads', icon: 'IconUserCheck', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CUSTOMERS_FIELD_ID, type: FieldType.NUMBER, name: 'customers', label: 'Customers', icon: 'IconUsersGroup', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_REVENUE_FIELD_ID, type: FieldType.NUMBER, name: 'revenue', label: 'Revenue', icon: 'IconCoinRupee', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CPL_FIELD_ID, type: FieldType.NUMBER, name: 'cpl', label: 'CPL', description: 'Cost per lead for this snapshot.', icon: 'IconReceipt', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CAC_FIELD_ID, type: FieldType.NUMBER, name: 'cac', label: 'CAC', description: 'Customer acquisition cost for this snapshot.', icon: 'IconReceiptRupee', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_ROAS_FIELD_ID, type: FieldType.NUMBER, name: 'roas', label: 'ROAS', description: 'Revenue divided by advertising spend.', icon: 'IconTrendingUp', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_CTR_FIELD_ID, type: FieldType.NUMBER, name: 'ctr', label: 'CTR', description: 'Click-through rate as a decimal value.', icon: 'IconPercentage', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_LEAD_TO_CUSTOMER_FIELD_ID, type: FieldType.NUMBER, name: 'leadToCustomerRate', label: 'Lead to Customer', description: 'Lead-to-customer conversion rate as a decimal value.', icon: 'IconPercentage', isNullable: true },
    { universalIdentifier: VYLINO_MARKETING_SYNCED_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'syncedAt', label: 'Synced At', icon: 'IconRefresh', isNullable: true },
  ],
});
