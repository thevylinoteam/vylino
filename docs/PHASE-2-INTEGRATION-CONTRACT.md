# Phase 2 Integration Contract

This document defines the shared contract for external marketing integrations in Vylino Business OS.

## Provider categories

- google_ads
- meta_ads
- social
- automation

## Connection status

Every provider connection must expose:

- provider
- account_id
- display_name
- connection_status: disconnected | connecting | connected | error | reauth_required
- auth_type
- scopes
- last_successful_sync_at
- last_attempted_sync_at
- last_error_code
- last_error_message
- is_read_only
- created_at
- updated_at

Secrets and refresh tokens must never be returned to the browser or stored in client-readable metadata.

## Sync contract

Every sync job must support:

- provider
- resource_type
- external_account_id
- date_from
- date_to
- cursor/page token when applicable
- status: queued | running | succeeded | partial | failed
- records_received
- records_created
- records_updated
- started_at
- completed_at
- error summary

Sync logic should be idempotent using provider + external resource ID as the stable identity wherever available.

## Common marketing dimensions

Where available, normalize provider data into these fields:

- external_campaign_id
- campaign_name
- channel
- status
- date
- currency
- spend
- impressions
- reach
- clicks
- conversions
- leads
- revenue

Preserve provider-specific payload identifiers separately so no source data needed for future reconciliation is lost.

## Attribution fields

Lead and opportunity attribution should support:

- first_touch_source
- first_touch_medium
- first_touch_campaign
- first_touch_content
- first_touch_landing_page
- first_touch_referrer
- last_touch_source
- last_touch_medium
- last_touch_campaign
- last_touch_content
- last_touch_landing_page
- gclid
- fbclid
- external_campaign_id
- external_ad_group_or_adset_id
- external_ad_id
- external_creative_id

Raw UTM values should be preserved exactly as received.

## Write-action policy

Phase 2 begins read-only for ad platforms.

Future write operations such as pause campaign, change budget, create ad, publish social post or delete content must:

1. Require explicit provider permission/scopes.
2. Require an authenticated Vylino user with the relevant role.
3. Be logged in the audit trail.
4. Record before/after state when practical.
5. Surface provider errors without silently retrying destructive operations.

## Automation boundary

Vylino may emit signed webhooks/events for n8n or another automation engine.

Initial event names:

- lead.created
- lead.qualified
- opportunity.won
- campaign.synced
- meta_lead.received
- social_post.ready
- integration.sync_failed

Incoming automation webhooks must be authenticated and replay-safe.
