import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { VYLINO_MARKETING_SNAPSHOT_OBJECT_ID } from '../objects/marketing-snapshot.object';

export default defineNavigationMenuItem({
  universalIdentifier: '9b0fc92f-9411-485c-aba8-b90909f95d4d',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: VYLINO_MARKETING_SNAPSHOT_OBJECT_ID,
});
