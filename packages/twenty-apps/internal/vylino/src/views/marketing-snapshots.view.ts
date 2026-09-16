import { defineView, ViewType } from 'twenty-sdk/define';

import {
  VYLINO_MARKETING_CAMPAIGN_NAME_FIELD_ID,
  VYLINO_MARKETING_CPL_FIELD_ID,
  VYLINO_MARKETING_LEADS_FIELD_ID,
  VYLINO_MARKETING_PERIOD_FIELD_ID,
  VYLINO_MARKETING_PROVIDER_FIELD_ID,
  VYLINO_MARKETING_REVENUE_FIELD_ID,
  VYLINO_MARKETING_ROAS_FIELD_ID,
  VYLINO_MARKETING_SCOPE_FIELD_ID,
  VYLINO_MARKETING_SNAPSHOT_KEY_FIELD_ID,
  VYLINO_MARKETING_SNAPSHOT_OBJECT_ID,
  VYLINO_MARKETING_SPEND_FIELD_ID,
  VYLINO_MARKETING_SYNCED_AT_FIELD_ID,
} from '../objects/marketing-snapshot.object';

export const VYLINO_MARKETING_SNAPSHOTS_VIEW_ID =
  'ce4d5c06-b5d4-4400-8308-05e7beb428c3';

export default defineView({
  universalIdentifier: VYLINO_MARKETING_SNAPSHOTS_VIEW_ID,
  name: 'Marketing Performance',
  objectUniversalIdentifier: VYLINO_MARKETING_SNAPSHOT_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconChartBar',
  position: 0,
  fields: [
    { universalIdentifier: '04ea3e23-9135-48fe-bddf-6763070418d5', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_SNAPSHOT_KEY_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '36f77251-a855-4eff-a787-87b521137708', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_PROVIDER_FIELD_ID, position: 1, isVisible: true, size: 130 },
    { universalIdentifier: '35d2f468-bd7d-49ad-8494-f64ce6d7ae9d', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_PERIOD_FIELD_ID, position: 2, isVisible: true, size: 140 },
    { universalIdentifier: '411f0701-5cb9-45ca-a22a-54933d37a7dd', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_SCOPE_FIELD_ID, position: 3, isVisible: true, size: 110 },
    { universalIdentifier: '866f3262-0194-441d-9978-a79fa209e517', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_CAMPAIGN_NAME_FIELD_ID, position: 4, isVisible: true, size: 220 },
    { universalIdentifier: '9ec74a6a-e27a-459b-a5b8-04a48bc024c0', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_SPEND_FIELD_ID, position: 5, isVisible: true, size: 120 },
    { universalIdentifier: 'd7c359d6-2f7d-4c6d-ba83-10740f97ac6d', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_LEADS_FIELD_ID, position: 6, isVisible: true, size: 100 },
    { universalIdentifier: '58a18a9c-213a-4be1-8fb6-a42d863e8a58', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_CPL_FIELD_ID, position: 7, isVisible: true, size: 100 },
    { universalIdentifier: '32c72fc6-1736-41ae-8b0b-55a29d06697e', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_REVENUE_FIELD_ID, position: 8, isVisible: true, size: 120 },
    { universalIdentifier: '6d6124a7-b2e0-4cf6-b309-c4e4e5cecba6', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_ROAS_FIELD_ID, position: 9, isVisible: true, size: 100 },
    { universalIdentifier: '24668758-f687-4f5e-808c-b2a4298e601c', fieldMetadataUniversalIdentifier: VYLINO_MARKETING_SYNCED_AT_FIELD_ID, position: 10, isVisible: true, size: 170 },
  ],
});
