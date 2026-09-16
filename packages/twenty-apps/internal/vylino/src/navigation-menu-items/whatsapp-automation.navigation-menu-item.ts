import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { VYLINO_WHATSAPP_AUTOMATION_DASHBOARD_ID } from '../page-layouts/whatsapp-automation-dashboard.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'fea0e217-c6c2-4e57-b3cf-66cddd7be295',
  name: 'WhatsApp Automation',
  icon: 'IconBrandWhatsapp',
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: VYLINO_WHATSAPP_AUTOMATION_DASHBOARD_ID,
});
