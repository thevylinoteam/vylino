import { Module } from '@nestjs/common';

import { VylinoWhatsAppAutomationService } from './vylino-whatsapp-automation.service';
import { VylinoWhatsAppCatalogController } from './vylino-whatsapp-catalog.controller';
import { VylinoWhatsAppCatalogService } from './vylino-whatsapp-catalog.service';
import { VylinoWhatsAppController } from './vylino-whatsapp.controller';
import { VylinoWhatsAppProviderService } from './vylino-whatsapp-provider.service';

@Module({
  controllers: [VylinoWhatsAppController, VylinoWhatsAppCatalogController],
  providers: [
    VylinoWhatsAppAutomationService,
    VylinoWhatsAppProviderService,
    VylinoWhatsAppCatalogService,
  ],
})
export class VylinoWhatsAppModule {}
