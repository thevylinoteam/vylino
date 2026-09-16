import type { PaymentLinkRequest, PaymentLinkResult } from '../whatsapp/types';

export type CashfreePaymentConfig = {
  clientId: string;
  clientSecret: string;
  apiVersion?: string;
  environment?: 'sandbox' | 'production';
  requestTimeoutMs?: number;
};

export class CashfreePaymentLinksClient {
  constructor(private readonly config: CashfreePaymentConfig) {}

  private get baseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  async createPaymentLink(
    input: PaymentLinkRequest,
  ): Promise<PaymentLinkResult> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.requestTimeoutMs ?? 15_000,
    );

    try {
      const response = await fetch(`${this.baseUrl}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': this.config.apiVersion ?? '2025-01-01',
          'x-client-id': this.config.clientId,
          'x-client-secret': this.config.clientSecret,
          'x-idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          link_id: input.paymentKey,
          link_amount: input.amount,
          link_currency: input.currencyCode,
          link_purpose: input.purpose,
          link_expiry_time: input.expiresAt,
          link_auto_reminders: true,
          customer_details: {
            customer_name: input.customer.name,
            customer_phone: input.customer.phone,
            customer_email: input.customer.email,
          },
          link_meta: {
            notify_url: input.notifyUrl,
            return_url: input.returnUrl,
          },
        }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as {
        cf_link_id?: number | string;
        link_id?: string;
        link_status?: string;
        link_url?: string;
        link_amount?: number;
        link_currency?: string;
        link_expiry_time?: string;
        message?: string;
      };

      if (!response.ok || !payload.link_url || !payload.link_id) {
        throw new Error(
          payload.message ?? `Cashfree payment link request failed: ${response.status}`,
        );
      }

      return {
        provider: 'CASHFREE',
        externalPaymentId: String(payload.cf_link_id ?? payload.link_id),
        paymentKey: payload.link_id,
        status: payload.link_status ?? 'ACTIVE',
        linkUrl: payload.link_url,
        amount: payload.link_amount ?? input.amount,
        currencyCode: payload.link_currency ?? input.currencyCode,
        expiresAt: payload.link_expiry_time,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
