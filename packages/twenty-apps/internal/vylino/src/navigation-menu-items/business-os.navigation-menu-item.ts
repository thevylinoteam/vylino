import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { VYLINO_BUSINESS_OS_DASHBOARD_PAGE_LAYOUT_ID } from '../page-layouts/business-os-dashboard.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: '89a7c273-3e67-48a6-9620-880a5162eae4',
  name: 'Vylino Business OS',
  icon: 'IconLayoutDashboard',
  position: 0,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: VYLINO_BUSINESS_OS_DASHBOARD_PAGE_LAYOUT_ID,
});
