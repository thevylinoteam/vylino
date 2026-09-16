# Vylino Business OS — Pre-Publish Checklist

Use this checklist before publishing or exposing Vylino Business OS to production traffic. Code completion alone is not a production release.

## 1. Release scope freeze

- [ ] Do not add new product features to the release candidate.
- [ ] Phase 2 CRM, lead ingestion, Vylino internal app and dashboards are included.
- [ ] Phase 3 paid-marketing scheduler and Google Ads / Meta Ads ingestion are included only when their production credentials are configured and smoke-tested.
- [ ] n8n write automation, social publishing and SEO/analytics automations that have not completed their Phase 3 hardening remain disabled.

## 2. Required CI gates

The exact release candidate commit must pass the relevant repository checks before deployment:

- [ ] `CI Twenty Apps`: immutable install, lint and TypeScript typecheck for the Vylino internal app.
- [ ] `CI Server`: server build.
- [ ] `CI Server`: backend lint and typecheck, including `vylino-integrations`.
- [ ] `CI Server`: server validation, migrations and generated-code checks.
- [ ] `CI Server`: unit-test shards.
- [ ] `CI Server`: affected integration-test shards.
- [ ] `CI Docker` when triggered.
- [ ] Front/E2E/shared/SDK checks complete successfully when triggered by the release candidate.

Do not publish from a different commit than the one that passed these gates.

## 3. Twenty deployment and Vylino app installation

- [ ] Deploy the validated Twenty server build to the target environment over HTTPS.
- [ ] Confirm PostgreSQL and Redis are persistent and backed up.
- [ ] Publish/install or upgrade `packages/twenty-apps/internal/vylino` in the target Twenty workspace.
- [ ] Confirm Vylino Person fields exist: lead source/channel, service interest, lead score, estimated value, follow-up, campaign, UTMs, GCLID/FBCLID, landing page/referrer and first-captured timestamp.
- [ ] Confirm the Opportunity `vylinoSalesStage` field and Vylino Sales Pipeline view exist.
- [ ] Confirm the `Vylino Marketing Snapshot` object exists.
- [ ] Confirm the Vylino Business OS navigation entry, Overview tab, Leads view and Marketing & ROAS tab render successfully.
- [ ] Enable `VYLINO_WRITE_ATTRIBUTION_FIELDS=true` only after the matching Vylino app fields are installed.

## 4. Server secrets and configuration

Store all secrets only in the deployment secret manager / server environment. Never commit them to Git or expose them to browser JavaScript.

Required for lead ingestion:

- [ ] `VYLINO_INGEST_SHARED_SECRET`
- [ ] `VYLINO_TWENTY_GRAPHQL_URL`
- [ ] `VYLINO_TWENTY_API_KEY`

Recommended lead configuration reviewed:

- [ ] `VYLINO_CREATE_OPPORTUNITY`
- [ ] `VYLINO_DEFAULT_OPPORTUNITY_STAGE=NEW_LEAD`
- [ ] `VYLINO_DEFAULT_CURRENCY_CODE=INR` or the actual deployment currency
- [ ] `VYLINO_DEFAULT_COMPANY_NAME` only if intentionally used

Paid-marketing automation:

- [ ] `VYLINO_MARKETING_SYNC_SHARED_SECRET`
- [ ] Keep `VYLINO_MARKETING_SYNC_ENABLED=false` until the manual Ads sync test passes.

Google Ads, if enabled:

- [ ] `GOOGLE_ADS_CUSTOMER_ID`
- [ ] `GOOGLE_ADS_CLIENT_ID`
- [ ] `GOOGLE_ADS_CLIENT_SECRET`
- [ ] `GOOGLE_ADS_REFRESH_TOKEN`
- [ ] Optional manager/API-version settings reviewed.

Meta Ads, if enabled:

- [ ] `META_ACCESS_TOKEN`
- [ ] `META_AD_ACCOUNT_ID`
- [ ] Optional `META_APP_SECRET` and API version reviewed.

## 5. Lead-ingestion smoke test

Test against the actual deployed environment, not only CI.

- [ ] Send one controlled lead to `POST /rest/vylino/leads/ingest` using the production shared-secret header.
- [ ] Verify the Person is created with correct email/phone and attribution.
- [ ] Verify Company association where supplied.
- [ ] Verify Opportunity creation where enabled and initial stage is `NEW_LEAD`.
- [ ] Replay the same submission and verify it does not create a duplicate Person or Opportunity.
- [ ] Send an updated submission for the same person and verify the intended update/deduplication behavior.
- [ ] Verify no shared secret, API key or provider credential appears in the browser, response body or ordinary logs.

## 6. WordPress / Elementor production wiring

The reusable capture helpers alone do not install tracking into the live WordPress site. Complete these deployment actions before relying on website attribution:

- [ ] Add the approved Elementor hidden fields for UTM source/medium/campaign/content/term, GCLID, FBCLID, landing page and referrer.
- [ ] Install the first-touch attribution/browser-storage integration on the live site.
- [ ] Configure the server-side Elementor/WordPress submission webhook to the deployed Vylino ingestion endpoint.
- [ ] Keep the ingestion secret server-side; do not embed it in public JavaScript.
- [ ] Submit a live test form from an attributed URL and verify the fields reach Twenty.
- [ ] Test a normal organic/direct form submission as well.

## 7. Paid-marketing smoke test

If Google Ads or Meta Ads is part of the initial release:

- [ ] Leave automatic scheduling disabled initially.
- [ ] Call `POST /rest/vylino/marketing/sync/run` with `x-vylino-sync-key`.
- [ ] Confirm `POST /rest/vylino/marketing/sync/status` reports `succeeded`.
- [ ] Verify provider-level and campaign-level snapshots were created/updated in Twenty.
- [ ] Compare spend, impressions, clicks and conversions against the source ad account for the same 30-day window.
- [ ] Confirm currency is correct; mixed currencies must not be combined into an `ALL` snapshot.
- [ ] Confirm Marketing & ROAS dashboard values are derived from persisted snapshots rather than placeholders.
- [ ] Only then set `VYLINO_MARKETING_SYNC_ENABLED=true` for hourly refresh.
- [ ] Observe at least one scheduled run and verify the Redis lock prevents duplicate concurrent execution.

## 8. UI acceptance check

On desktop and mobile-width browsers:

- [ ] Login/logout works.
- [ ] Vylino Business OS sidebar navigation works.
- [ ] Overview dashboard loads without console/API errors.
- [ ] Vylino Leads table opens and relevant columns render.
- [ ] Person/lead detail exposes the intended sales and attribution information.
- [ ] Sales Pipeline view groups Opportunities by Vylino stage correctly.
- [ ] Marketing & ROAS renders correctly with no data and with real snapshot data.
- [ ] Search, filters and standard Twenty navigation remain functional.

## 9. Security and operations

- [ ] Production is HTTPS-only.
- [ ] Shared ingestion/sync secrets are long, random and different from user passwords.
- [ ] Twenty API key has only the permissions required for this deployment.
- [ ] Redis and PostgreSQL are not publicly exposed.
- [ ] Database backup has been created and restore procedure is known.
- [ ] Server and worker health checks are enabled.
- [ ] Logs do not print OAuth refresh tokens, Meta tokens, Twenty API keys or shared secrets.
- [ ] Rate limiting / reverse-proxy request limits are configured for public webhook routes.
- [ ] Rotate any credential that was previously used in an insecure development environment.

## 10. Features intentionally not treated as production-complete yet

Unless separately validated before launch, keep these disabled or out of the release promise:

- [ ] n8n outbound automation requiring signed/HMAC webhook hardening and replay protection.
- [ ] automatic social publishing / Postiz production actions.
- [ ] automated GSC/GA4/SEO jobs not yet completed in Phase 3.
- [ ] any destructive Ads write/control capability; current paid-marketing implementation is reporting/sync focused.

## 11. Rollback plan

Before release:

- [ ] Record the exact deployed Git commit and container/image version.
- [ ] Take a database backup/snapshot.
- [ ] Keep the previously working application image available.
- [ ] To stop Ads automation immediately, set `VYLINO_MARKETING_SYNC_ENABLED=false`.
- [ ] To stop public lead ingestion immediately, rotate/remove the ingestion secret or block the route at the reverse proxy.
- [ ] If the release must be reverted, deploy the previous image first; do not delete CRM data created by valid leads unless explicitly reviewed.

## Publish decision

Publish only when all release-blocking items above that apply to the selected release scope are checked and the exact deployed commit has green CI. Live provider/app installation and smoke-test items cannot be replaced by source-code review alone.
