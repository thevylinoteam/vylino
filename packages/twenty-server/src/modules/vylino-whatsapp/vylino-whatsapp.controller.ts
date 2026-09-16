import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { VylinoWhatsAppAutomationService } from './vylino-whatsapp-automation.service';
import { VylinoWhatsAppProviderService } from './vylino-whatsapp-provider.service';

const safeEquals = (supplied: string, expected: string) => {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

@Controller(`${ApiPath.Rest}/vylino/whatsapp`)
export class VylinoWhatsAppController {
  constructor(
    private readonly automation: VylinoWhatsAppAutomationService,
    private readonly provider: VylinoWhatsAppProviderService,
  ) {}

  @Get('webhook/meta')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  verifyMetaWebhook(@Req() request: Request, @Res() response: Response) {
    const mode = String(request.query['hub.mode'] ?? '');
    const token = String(request.query['hub.verify_token'] ?? '');
    const challenge = String(request.query['hub.challenge'] ?? '');
    const expected = process.env.WHATSAPP_CLOUD_VERIFY_TOKEN;

    if (mode === 'subscribe' && expected && safeEquals(token, expected)) {
      return response.status(200).send(challenge);
    }
    return response.status(403).send('Forbidden');
  }

  @Post('webhook/meta')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async receiveMetaWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Res() response: Response,
    @Body() body: unknown,
  ) {
    const rawBody = request.rawBody;
    if (!rawBody) {
      return response
        .status(400)
        .json({ ok: false, error: 'raw_body_unavailable' });
    }
    if (
      !this.provider.verifyMetaSignature(
        rawBody,
        request.header('x-hub-signature-256'),
      )
    ) {
      return response
        .status(401)
        .json({ ok: false, error: 'invalid_signature' });
    }

    try {
      const parsed = this.provider.parseMetaWebhook(body);
      await this.automation.processDeliveryStatuses(parsed.statuses);
      const result = await this.automation.handleInbound(parsed.messages);
      return response.status(200).json({ ok: true, ...result });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'whatsapp_webhook_failed',
        message:
          error instanceof Error ? error.message : 'WhatsApp webhook failed',
      });
    }
  }

  @Post('webhook/evolution')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async receiveEvolutionWebhook(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: unknown,
  ) {
    const expected = process.env.VYLINO_EVOLUTION_WEBHOOK_SECRET;
    const supplied = request.header('x-vylino-evolution-key');
    if (!expected || !supplied || !safeEquals(supplied, expected)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }

    try {
      const messages = this.provider.parseEvolutionWebhook(body);
      const result = await this.automation.handleInbound(messages);
      return response.status(200).json({ ok: true, ...result });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'evolution_webhook_failed',
        message:
          error instanceof Error ? error.message : 'Evolution webhook failed',
      });
    }
  }

  @Post('send')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async send(
    @Req() request: Request,
    @Res() response: Response,
    @Body()
    body: {
      conversationKey?: string;
      text?: string;
      templateName?: string;
      languageCode?: string;
      components?: unknown[];
    },
  ) {
    if (!this.isOperatorAuthorized(request)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }
    if (!body?.conversationKey || (!body.text && !body.templateName)) {
      return response.status(400).json({ ok: false, error: 'invalid_payload' });
    }

    try {
      const result = await this.automation.manualSend({
        conversationKey: body.conversationKey,
        text: body.text,
        templateName: body.templateName,
        languageCode: body.languageCode,
        components: body.components,
      });
      return response.status(200).json({ ok: true, ...result });
    } catch (error) {
      return response.status(400).json({
        ok: false,
        error: 'send_failed',
        message: error instanceof Error ? error.message : 'Send failed',
      });
    }
  }

  @Post('conversations/:conversationKey/takeover')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async takeover(
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationKey') conversationKey: string,
    @Body() body: { humanOwner?: string },
  ) {
    if (!this.isOperatorAuthorized(request)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }
    try {
      const result = await this.automation.setHumanMode(
        decodeURIComponent(conversationKey),
        body?.humanOwner,
      );
      return response.status(200).json({ ok: true, conversation: result });
    } catch (error) {
      return response.status(400).json({
        ok: false,
        error: 'takeover_failed',
        message: error instanceof Error ? error.message : 'Takeover failed',
      });
    }
  }

  @Post('conversations/:conversationKey/release')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async release(
    @Req() request: Request,
    @Res() response: Response,
    @Param('conversationKey') conversationKey: string,
  ) {
    if (!this.isOperatorAuthorized(request)) {
      return response.status(401).json({ ok: false, error: 'unauthorized' });
    }
    try {
      const result = await this.automation.releaseToBot(
        decodeURIComponent(conversationKey),
      );
      return response.status(200).json({ ok: true, conversation: result });
    } catch (error) {
      return response.status(400).json({
        ok: false,
        error: 'release_failed',
        message: error instanceof Error ? error.message : 'Release failed',
      });
    }
  }

  @Post('webhook/cashfree')
  @HttpCode(200)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async cashfreeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Res() response: Response,
    @Body() body: unknown,
  ) {
    if (
      !request.rawBody ||
      !this.automation.verifyCashfreeSignature(
        request.rawBody,
        request.header('x-webhook-timestamp'),
        request.header('x-webhook-signature'),
      )
    ) {
      return response
        .status(401)
        .json({ ok: false, error: 'invalid_signature' });
    }

    try {
      const result = await this.automation.handleCashfreeWebhook(body);
      return response.status(200).json({ ok: true, ...result });
    } catch (error) {
      return response.status(500).json({
        ok: false,
        error: 'cashfree_webhook_failed',
        message:
          error instanceof Error ? error.message : 'Cashfree webhook failed',
      });
    }
  }

  private isOperatorAuthorized(request: Request) {
    const expected = process.env.VYLINO_WHATSAPP_SHARED_SECRET;
    const supplied = request.header('x-vylino-whatsapp-key');
    return Boolean(expected && supplied && safeEquals(supplied, expected));
  }
}
