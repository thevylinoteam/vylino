# WhatsApp Automation Runtime Configuration

Phase 4 is disabled by default. Configure the CRM objects/app first, then provider credentials, then enable automation only after sandbox/smoke tests pass.

## Core Vylino / Twenty

```env
VYLINO_TWENTY_GRAPHQL_URL=https://crm.example.com/graphql
VYLINO_TWENTY_API_KEY=...
VYLINO_WHATSAPP_ENABLED=false
VYLINO_WHATSAPP_PROVIDER=META_CLOUD
VYLINO_WHATSAPP_SHARED_SECRET=generate-a-long-random-operator-secret
VYLINO_WHATSAPP_AUTOMATION_MODE_DEFAULT=BOT
```

Supported default automation modes:

- `BOT`
- `ASSISTED`
- `HUMAN`
- `PAUSED`

Keep `VYLINO_WHATSAPP_ENABLED=false` until webhook signature validation, catalog setup and sandbox payment testing are complete.

## Meta WhatsApp Cloud API — production default

```env
VYLINO_WHATSAPP_PROVIDER=META_CLOUD
WHATSAPP_CLOUD_ACCESS_TOKEN=...
WHATSAPP_CLOUD_PHONE_NUMBER_ID=...
WHATSAPP_CLOUD_VERIFY_TOKEN=generate-a-random-webhook-verification-token
VYLINO_WHATSAPP_META_APP_SECRET=...
WHATSAPP_CLOUD_GRAPH_API_VERSION=v26.0
```

Configure Meta webhook URLs:

```text
GET/POST https://<crm-host>/rest/vylino/whatsapp/webhook/meta
```

The GET route handles Meta's verification challenge. POST requests must pass Meta's `x-hub-signature-256` verification before any CRM mutation is performed.

## Optional Evolution API transport

Evolution API is optional. The production recommendation remains the official Meta Cloud API. Evolution is useful when a separate self-hosted gateway is explicitly wanted.

```env
VYLINO_WHATSAPP_PROVIDER=EVOLUTION
EVOLUTION_API_BASE_URL=https://wa.example.com
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE_NAME=vylino
VYLINO_EVOLUTION_WEBHOOK_SECRET=generate-a-long-random-webhook-secret
```

Set its message webhook to:

```text
POST https://<crm-host>/rest/vylino/whatsapp/webhook/evolution
Header: x-vylino-evolution-key: <VYLINO_EVOLUTION_WEBHOOK_SECRET>
```

The current Vylino adapter handles text-style `messages.upsert` events and outbound text sending. Approved WhatsApp Business templates should be sent through the official Meta Cloud transport.

## Cashfree Payment Links

Start in sandbox.

```env
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_CLIENT_ID=...
CASHFREE_CLIENT_SECRET=...
CASHFREE_API_VERSION=2025-01-01
VYLINO_CASHFREE_NOTIFY_URL=https://<crm-host>/rest/vylino/whatsapp/webhook/cashfree
VYLINO_CASHFREE_RETURN_URL=https://vylino.com/payment-status/
```

The Cashfree webhook endpoint verifies the signature using the raw request body and webhook timestamp before updating a Payment Request.

After sandbox validation, switch only the environment variable and production Cashfree credentials:

```env
CASHFREE_ENVIRONMENT=production
```

## Approved WhatsApp templates

If payment confirmation needs to be sent after the free-form customer-service window closes, configure an approved Meta template:

```env
VYLINO_WHATSAPP_PAYMENT_SUCCESS_TEMPLATE=vylino_payment_received
VYLINO_WHATSAPP_TEMPLATE_LANGUAGE=en
```

## Routes

### Provider webhooks

- `GET /rest/vylino/whatsapp/webhook/meta`
- `POST /rest/vylino/whatsapp/webhook/meta`
- `POST /rest/vylino/whatsapp/webhook/evolution`
- `POST /rest/vylino/whatsapp/webhook/cashfree`

### Operator routes

These require:

```text
x-vylino-whatsapp-key: <VYLINO_WHATSAPP_SHARED_SECRET>
```

Routes:

- `POST /rest/vylino/whatsapp/send`
- `POST /rest/vylino/whatsapp/conversations/:conversationKey/takeover`
- `POST /rest/vylino/whatsapp/conversations/:conversationKey/release`
- `POST /rest/vylino/whatsapp/catalog/seed`

## Catalog bootstrap

After installing/upgrading the Vylino internal Twenty app, call the protected catalog seed endpoint once.

It creates the default service categories and matching keywords, but deliberately **does not set prices**.

Before automatic payment links are enabled for a service:

1. review the service description and keywords in `WhatsApp Service Catalog`;
2. enter the approved `basePrice`;
3. set the correct `currencyCode` (normally `INR`);
4. confirm `isActive=true`;
5. confirm `paymentRequired=true` when relevant.

If a service has no approved positive price, the automation will not generate a payment link for it.

## CRM / sales behavior

A first WhatsApp conversation:

1. finds/creates a Twenty Person by phone number;
2. creates a Vylino Opportunity in `NEW_LEAD`;
3. creates the WhatsApp Conversation and stores its Opportunity ID.

Conversation status updates advance the same sales pipeline:

- `HUMAN_HANDOFF` → `CONTACTED`
- `WAITING_CUSTOMER` → `QUALIFIED`
- `WAITING_PAYMENT` → `PROPOSAL_SENT`
- `WON` → `WON`
- `CLOSED` → `LOST`

A verified Cashfree `PAID` event marks the WhatsApp conversation `WON`, which also marks the linked Vylino Opportunity `WON`.

## Pre-enable smoke test

Keep `VYLINO_WHATSAPP_ENABLED=false` and perform these steps in order:

1. install/upgrade the Vylino internal app;
2. verify WhatsApp Conversation, Message, Service Catalog and Payment Request objects appear;
3. seed the catalog and set a sandbox test service price;
4. configure Meta Cloud API or Evolution credentials;
5. verify inbound webhook signature/security behavior;
6. send one inbound test message and confirm Person + Opportunity + Conversation + Message creation;
7. replay the exact same provider message ID and confirm it is treated as duplicate;
8. turn `VYLINO_WHATSAPP_ENABLED=true` in a non-production/test environment;
9. test a website-development enquiry and verify recommendation + reply;
10. test `human` and verify handoff/no further bot replies;
11. test `stop` and verify opt-out;
12. test payment intent with a priced service and confirm Cashfree sandbox link;
13. complete sandbox payment and verify Payment Request + Conversation + Opportunity become paid/won;
14. test free-form manual send after the customer-service window is closed and confirm it is blocked without an approved template;
15. only then enable the production environment.

## Security notes

- Never expose Meta, Evolution, Cashfree or Twenty API secrets in the browser.
- Rotate shared secrets before production if they were ever copied into logs or tickets.
- Apply reverse-proxy/IP rate limits to public webhook routes.
- Store provider credentials in the deployment secret manager/environment, not Git.
- Keep proactive/broadcast messaging disabled until explicit opt-in and approved template rules are implemented and tested.
