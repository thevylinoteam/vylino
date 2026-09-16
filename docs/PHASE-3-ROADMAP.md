# Vylino Business OS — Phase 3 Automation Roadmap

Phase 3 turns the Phase 2 integration contracts and dashboard into an operational, self-running system.

## Objective

Automate data collection and operational workflows so Vylino Business OS continuously updates CRM, marketing, ads, social, SEO and reporting data without manual imports.

## P3.1 — Runtime automation foundation — IMPLEMENTED

- Add scheduled marketing sync runtime to Twenty server.
- Run paid-marketing refresh hourly when enabled.
- Add Redis distributed lock so only one server instance performs a sync.
- Add manual protected sync endpoint for operators.
- Record last run, last success, error and duration for health reporting.
- Never expose provider credentials to the browser.

## P3.2 — Google Ads and Meta Ads scheduled ingestion — IMPLEMENTED IN SOURCE

- Load Google OAuth and Meta access credentials from server environment / secret store.
- Pull account, campaign and rolling 30-day metrics for the configured reporting window.
- Normalize Google Ads and Meta Ads metrics into a common server-side metric model.
- Build account/provider/campaign snapshots.
- Upsert snapshots directly into Twenty.
- Preserve existing snapshots if a configured provider returns no usable records or fails.
- Keep combined `ALL` financial snapshots currency-safe.
- Keep API versions configurable through environment variables.

P3.2 is considered live only after deployment credentials are configured and a manual production sync completes successfully.

## P3.3 — Sync health and retry controls — NEXT

- Persist sync run history.
- Track provider status, records read, snapshots written, duration and errors.
- Retry transient provider/network errors with bounded exponential backoff.
- Surface stale-data warnings in the Business OS dashboard.

## P3.4 — n8n workflow automation

- CRM lead-created and lead-qualified workflows.
- Opportunity-won workflow to project/customer onboarding.
- Failed-sync alert workflow.
- Revenue-attribution update workflow.
- Signed webhook verification and replay protection.

## P3.5 — Social publishing automation

- Wire Postiz/self-hosted social publishing runtime.
- Draft, approve, schedule and publish content.
- Track publishing status and failures.
- Keep approval required for public posts until policy is explicitly changed.

## P3.6 — SEO and analytics automation

- Scheduled Search Console imports.
- Scheduled GA4 imports.
- Page/query opportunity generation.
- WordPress content inventory sync.
- Broken-link/orphan/stale-page checks.

## P3.7 — Business OS automation controls

- Integration status screen.
- Last successful sync and freshness indicators.
- Manual sync buttons.
- Enable/disable controls per integration.
- Error details without exposing secrets.

## P3.8 — Reliability and audit hardening

- Cryptographic idempotency keys.
- Distributed locks and replay protection.
- Audit trail for write actions.
- Bounded retries and dead-letter handling.
- Currency-safe financial aggregation.

## P3.9 — Deployment and secret management

- Production environment contract.
- Secret rotation procedure.
- Health/readiness checks.
- Backup/restore verification.
- Deployment runbook for self-hosted Vylino Business OS.

## P3.10 — Phase 3 exit criteria

Phase 3 is complete when:

1. Google Ads and Meta Ads update the Marketing & ROAS dashboard automatically.
2. Sync failures are visible and recoverable without editing code.
3. Leads continue to enter Twenty idempotently from WordPress/Elementor.
4. Automation webhooks are signed/replay-safe.
5. Social/SEO/analytics jobs have controlled scheduled execution.
6. No provider credential is exposed to client-side code or committed to Git.
7. CI lint/typecheck/build gates pass for the affected backend and Vylino app projects.
