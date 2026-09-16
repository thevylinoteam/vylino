# Vylino Business OS — Phase 3 Runtime Configuration

This document covers the P3.1/P3.2 paid-marketing automation runtime.

## Activation

Paid-marketing automation is disabled by default. Enable it only after the Vylino internal Twenty app is installed and the marketing snapshot object is available.

```bash
VYLINO_MARKETING_SYNC_ENABLED=true
```

The Twenty server runs the paid-marketing refresh hourly. Operators can also trigger it manually through:

```text
POST /rest/vylino/marketing/sync/run
```

and inspect current health through:

```text
POST /rest/vylino/marketing/sync/status
```

Both operator endpoints require:

```text
x-vylino-sync-key: <shared secret>
```

Configure the secret with `VYLINO_MARKETING_SYNC_SHARED_SECRET`. If absent, the server falls back to `VYLINO_MARKETING_INGEST_SHARED_SECRET`, then `VYLINO_INGEST_SHARED_SECRET`.

## Twenty persistence

Required for writing the normalized snapshots into the Vylino Marketing Snapshot object:

```bash
VYLINO_TWENTY_GRAPHQL_URL=https://<twenty-host>/graphql
VYLINO_TWENTY_API_KEY=<server-side-api-key>
```

Never expose these values to browser JavaScript.

## Google Ads

Required:

```bash
GOOGLE_ADS_CUSTOMER_ID=<customer-id>
GOOGLE_ADS_CLIENT_ID=<oauth-client-id>
GOOGLE_ADS_CLIENT_SECRET=<oauth-client-secret>
GOOGLE_ADS_REFRESH_TOKEN=<oauth-refresh-token>
```

Optional:

```bash
GOOGLE_ADS_LOGIN_CUSTOMER_ID=<manager-account-id>
GOOGLE_ADS_API_VERSION=v25
GOOGLE_ADS_DEVELOPER_TOKEN=<legacy/backward-compatible-header>
```

Customer IDs may be supplied with or without dashes; the runtime normalizes them before requests.

## Meta Ads

Required:

```bash
META_ACCESS_TOKEN=<system-user-or-supported-long-lived-token>
META_AD_ACCOUNT_ID=<ad-account-id>
```

Optional:

```bash
META_APP_SECRET=<app-secret>
META_GRAPH_API_VERSION=v26.0
```

When `META_APP_SECRET` is supplied, the runtime adds `appsecret_proof` to Graph API requests.

## Reporting window

P3.2 currently refreshes a rolling 30-day window and persists:

- one provider-level Google Ads snapshot;
- one provider-level Meta Ads snapshot;
- per-campaign snapshots for each configured provider;
- one `ALL` account snapshot when configured-provider currencies are compatible.

If multiple configured providers return different currencies, the combined `ALL` snapshot is not written. Provider-level snapshots remain currency-safe.

If a configured provider returns no metric rows, the run fails without overwriting existing snapshots with zeros.

## Concurrency and failure safety

- Redis holds a distributed lock for a maximum of 20 minutes.
- A second server instance or manual trigger skips while the lock is active.
- Lock release uses token comparison to avoid releasing another process's lock.
- Sync status is retained in Redis for 30 days.
- Provider credentials are read only from server environment variables.
- Provider data is fetched before snapshot persistence begins.
- Provider execution now occurs inside `twenty-server`; `VYLINO_MARKETING_SYNC_EXECUTOR_URL` is no longer required.

## Current output semantics

Google Ads:

- `metrics.cost_micros` -> spend
- impressions/clicks -> traffic metrics
- conversions -> leads
- conversions value -> attributed revenue

Meta Ads:

- spend/impressions/clicks -> media metrics
- lead action -> leads
- purchase action -> customers
- purchase action value -> revenue

Equivalent Meta action aliases are treated as alternatives rather than summed together, reducing duplicate conversion counting.

## Safe rollout sequence

1. Install/update the Vylino internal Twenty app.
2. Confirm `Vylino Marketing Snapshot` exists.
3. Configure Twenty GraphQL URL/API key.
4. Configure one or both ad providers.
5. Configure `VYLINO_MARKETING_SYNC_SHARED_SECRET`.
6. Set `VYLINO_MARKETING_SYNC_ENABLED=true`.
7. Call the protected `sync/run` endpoint once.
8. Verify `sync/status` reports `succeeded`.
9. Confirm the Marketing & ROAS dashboard displays the persisted 30-day snapshots.
10. Leave hourly scheduling enabled only after the manual run is verified.
