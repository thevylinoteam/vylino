# Vylino Business OS — Production Launch Runbook

This runbook is the operational launch gate for the Vylino Business OS release candidate. It consolidates the pre-publish, paid-marketing, lead-ingestion and WhatsApp/Cashfree activation steps into one controlled sequence.

## Release scope

The launch candidate includes:

- Vylino Business OS on Twenty CRM
- lead, contact, company and opportunity management
- Vylino sales pipeline and follow-up fields
- WordPress/Elementor lead-ingestion endpoint and attribution capture
- Vylino dashboard and marketing snapshots
- Google Ads and Meta Ads reporting/sync foundation
- scheduled paid-marketing snapshot refresh with Redis locking
- WhatsApp conversation and message history inside the same CRM
- Meta WhatsApp Cloud API production transport
- optional Evolution API transport
- WhatsApp service recommendations, bot/human handoff and opt-out handling
- Cashfree Payment Links and payment-status reconciliation
- WhatsApp lead → Person → Opportunity → payment → WON sales-flow linkage

Do not add further product features to this release candidate. Any new feature starts after launch validation.

## Safe defaults at first deployment

Deploy the application with automation disabled:

```env
VYLINO_MARKETING_SYNC_ENABLED=false
VYLINO_WHATSAPP_ENABLED=false
```

Keep destructive Ads write/control operations disabled. Keep unvalidated n8n outbound automation, automatic social publishing and unfinished SEO/analytics jobs outside the initial launch promise.

## 1. CI release gate

Use one exact commit for validation and deployment.

Before creating the production release image, confirm that the release-candidate commit passes the applicable repository checks, especially:

- `CI Twenty Apps`
- `CI Server` build
- `CI Server` lint and TypeScript typecheck
- `CI Server` validation/migration/code-generation checks
- `CI Server` unit and integration tests
- `CI Docker`
- Front, E2E, Shared and SDK checks when triggered

Do not deploy a later unvalidated commit. Record the deployed Git SHA and container/image identifier in the deployment record.

## 2. Infrastructure readiness

Before deployment:

1. Take a PostgreSQL backup/snapshot and confirm restore access.
2. Confirm Redis persistence/availability for locks and idempotency.
3. Confirm PostgreSQL and Redis are not publicly exposed.
4. Confirm production HTTPS and reverse-proxy configuration.
5. Configure health checks for server and worker processes.
6. Keep the previously working application image available for rollback.
7. Apply rate/request limits to public webhook routes.

## 3. Core Vylino/Twenty configuration

Store all credentials only in the production secret manager or server environment.

```env
VYLINO_TWENTY_GRAPHQL_URL=https://<crm-host>/graphql
VYLINO_TWENTY_API_KEY=...
VYLINO_INGEST_SHARED_SECRET=...
VYLINO_DEFAULT_OPPORTUNITY_STAGE=NEW_LEAD
VYLINO_DEFAULT_CURRENCY_CODE=INR
```

Set `VYLINO_WRITE_ATTRIBUTION_FIELDS=true` only after the updated Vylino internal app has installed the matching Person fields in the target workspace.

## 4. Install/upgrade the Vylino internal app

Install or upgrade `packages/twenty-apps/internal/vylino` in the production workspace, then verify:

- Vylino Business OS navigation and dashboard load successfully
- lead source/channel, service interest, scoring, campaign and attribution fields exist
- Opportunity `vylinoSalesStage` exists
- Vylino Sales Pipeline view works
- Vylino Marketing Snapshot object exists
- WhatsApp Conversation object exists
- WhatsApp Message object exists
- WhatsApp Service Catalog object exists
- Payment Request object exists
- WhatsApp Automation dashboard and its table views render

Do not enable provider automations until this schema/app installation is complete.

## 5. Website lead-ingestion smoke test

Configure the protected WordPress/Elementor server-side submission webhook to:

```text
POST /rest/vylino/leads/ingest
```

Then run a controlled attributed lead test and confirm:

1. Person is created or deduplicated correctly.
2. Company association is correct when supplied.
3. Opportunity is created at `NEW_LEAD` when enabled.
4. UTM/GCLID/FBCLID/landing/referrer data is retained when configured.
5. Replaying the exact same submission does not create duplicate CRM records.
6. No secret/API key appears in browser code, response bodies or ordinary logs.

## 6. Paid-marketing configuration and controlled activation

Configure the server-side provider credentials required for the accounts being used.

Google Ads:

```env
GOOGLE_ADS_CUSTOMER_ID=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
# optional: GOOGLE_ADS_LOGIN_CUSTOMER_ID, GOOGLE_ADS_API_VERSION, GOOGLE_ADS_DEVELOPER_TOKEN
```

Meta Ads:

```env
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=...
# optional: META_APP_SECRET, META_GRAPH_API_VERSION
```

Automation:

```env
VYLINO_MARKETING_SYNC_SHARED_SECRET=...
VYLINO_MARKETING_SYNC_ENABLED=false
```

Run the protected manual sync first:

```text
POST /rest/vylino/marketing/sync/run
Header: x-vylino-sync-key: <VYLINO_MARKETING_SYNC_SHARED_SECRET>
```

Confirm sync status succeeds, compare spend/impressions/clicks/conversions against the source accounts for the same period, and verify persisted account/campaign snapshots and dashboard values. Only after that set:

```env
VYLINO_MARKETING_SYNC_ENABLED=true
```

Observe at least one scheduled run and confirm the Redis lock prevents concurrent duplicate runs.

## 7. WhatsApp production configuration

Meta WhatsApp Cloud API is the production-default transport.

Start disabled:

```env
VYLINO_WHATSAPP_ENABLED=false
VYLINO_WHATSAPP_PROVIDER=META_CLOUD
VYLINO_WHATSAPP_SHARED_SECRET=...
VYLINO_WHATSAPP_AUTOMATION_MODE_DEFAULT=BOT
WHATSAPP_CLOUD_ACCESS_TOKEN=...
WHATSAPP_CLOUD_PHONE_NUMBER_ID=...
WHATSAPP_CLOUD_VERIFY_TOKEN=...
VYLINO_WHATSAPP_META_APP_SECRET=...
WHATSAPP_CLOUD_GRAPH_API_VERSION=v26.0
```

Meta webhook:

```text
GET/POST https://<crm-host>/rest/vylino/whatsapp/webhook/meta
```

Verify Meta webhook challenge handling and `x-hub-signature-256` validation before enabling automated replies.

Evolution API remains optional and should only be configured when a separate self-hosted WhatsApp gateway is intentionally required.

## 8. WhatsApp catalog and CRM flow test

Call the protected catalog seed endpoint once:

```text
POST /rest/vylino/whatsapp/catalog/seed
Header: x-vylino-whatsapp-key: <VYLINO_WHATSAPP_SHARED_SECRET>
```

The seed deliberately contains no approved prices. Review each enabled service, enter the approved `basePrice` and currency, and verify `paymentRequired` before payment-link automation is used.

With `VYLINO_WHATSAPP_ENABLED=false`, first verify inbound persistence and duplicate protection. Then enable it in a non-production/test environment and confirm:

1. an inbound customer creates/finds the Twenty Person;
2. a new Opportunity is created at `NEW_LEAD`;
3. the Conversation and Message history are persisted;
4. duplicate provider message IDs are ignored;
5. website/ecommerce/SEO/marketing enquiries receive the intended service recommendation;
6. `human` causes handoff and pauses bot replies;
7. `stop` causes opt-out;
8. free-form operator messages outside the customer-service window are blocked unless an approved template is used.

Expected CRM stage mapping:

- `HUMAN_HANDOFF` → `CONTACTED`
- `WAITING_CUSTOMER` → `QUALIFIED`
- `WAITING_PAYMENT` → `PROPOSAL_SENT`
- verified payment / `WON` → `WON`
- `CLOSED` → `LOST`

## 9. Cashfree sandbox gate

Configure Cashfree in sandbox first:

```env
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_CLIENT_ID=...
CASHFREE_CLIENT_SECRET=...
CASHFREE_API_VERSION=2025-01-01
VYLINO_CASHFREE_NOTIFY_URL=https://<crm-host>/rest/vylino/whatsapp/webhook/cashfree
VYLINO_CASHFREE_RETURN_URL=https://vylino.com/payment-status/
```

Test one priced service end to end:

1. customer requests payment;
2. a Cashfree Payment Link is created for the approved CRM amount;
3. the link is persisted in Payment Request and sent to WhatsApp;
4. sandbox payment is completed;
5. webhook signature is verified from the raw request body;
6. Payment Request becomes `PAID`;
7. WhatsApp Conversation becomes `WON`;
8. linked Opportunity becomes `WON`;
9. payment confirmation follows the open-window/template rule.

Only after this test succeeds should production Cashfree credentials be installed and `CASHFREE_ENVIRONMENT=production` be used.

## 10. Final UI acceptance

Check both desktop and mobile-width browsers:

- login/logout
- Vylino Business OS navigation
- Overview dashboard
- Leads view and Person detail
- Sales Pipeline
- Marketing & ROAS with empty and real data
- WhatsApp Automation dashboard
- Conversations, Messages, Service Catalog and Payment Requests
- standard Twenty search, filters and navigation
- no blocking console/API errors

## 11. Production activation order

Activate in this order:

1. Deploy exact green CI release candidate with automations off.
2. Install/upgrade the Vylino internal app.
3. Complete website lead smoke + duplicate replay.
4. Complete manual paid-marketing sync and source-account comparison.
5. Complete Meta WhatsApp webhook/signature + inbound persistence tests.
6. Seed/review catalog and enter approved service prices.
7. Complete Cashfree sandbox end-to-end payment test.
8. Complete WhatsApp recommendation, human-handoff, opt-out and service-window tests.
9. Install production payment credentials.
10. Set `VYLINO_WHATSAPP_ENABLED=true` only after the WhatsApp/payment gates pass.
11. Set `VYLINO_MARKETING_SYNC_ENABLED=true` only after manual Ads sync validation passes.

## 12. First-day monitoring

Monitor closely after activation:

- server/worker error rates and restarts
- PostgreSQL/Redis health
- duplicate lead/message prevention
- webhook authentication/signature failures
- WhatsApp outbound delivery failures
- unexpected bot handoff/opt-out behavior
- Cashfree amount or status mismatches
- Opportunity stage transitions
- paid-marketing sync failures and Redis lock skips
- dashboard data freshness

Keep provider automation disabled if its source data or webhook behavior cannot be reconciled confidently.

## 13. Rollback / kill switches

Immediate automation kill switches:

```env
VYLINO_WHATSAPP_ENABLED=false
VYLINO_MARKETING_SYNC_ENABLED=false
```

If required, also block the relevant public webhook route at the reverse proxy and rotate/remove the related shared secret.

For application rollback:

1. deploy the previously working application image;
2. keep the database backup available;
3. do not delete valid CRM leads/messages/payments merely because the application was rolled back;
4. investigate and reconcile provider/webhook events before re-enabling automation.

## Go / no-go rule

The application is launch-ready only when the exact deployable commit has green applicable CI and all live-environment smoke tests relevant to the enabled features have passed. Source-code validation alone does not substitute for Meta, Google Ads, Cashfree, WordPress or target-workspace credential/configuration tests.
