import type { VylinoN8nConfig } from './config';
import type { VylinoAutomationEvent } from './types';

export class VylinoN8nWebhookClient {
  constructor(private readonly config: VylinoN8nConfig) {}

  async deliver(event: VylinoAutomationEvent): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      return await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-vylino-event': event.name,
          'x-vylino-event-id': event.id,
          'x-vylino-idempotency-key': event.idempotencyKey,
          ...(this.config.webhookSecret
            ? { 'x-vylino-webhook-secret': this.config.webhookSecret }
            : {}),
        },
        body: JSON.stringify(event),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
