import { Module } from '@nestjs/common';

import { VylinoWhatsAppAutomationService } from './vylino-whatsapp-automation.service';
import { VylinoWhatsAppController } from './vylino-whatsapp.controller';
import { VylinoWhatsAppProviderService } from './vylino-whatsapp-provider.service';

@Module({
  controllers: [VylinoWhatsAppController],
  providers: [VylinoWhatsAppAutomationService, VylinoWhatsAppProviderService],
})
export class VylinoWhatsAppModule {}
