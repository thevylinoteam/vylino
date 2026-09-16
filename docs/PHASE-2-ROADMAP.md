# Vylino Business OS — Phase 2 Roadmap

Phase 2 adds the marketing and automation layer on top of the CRM foundation.

## Scope

1. Google Ads integration
2. Meta Ads integration
3. Social media control center
4. Marketing attribution
5. Automation workflows
6. Unified marketing reporting

## Delivery order

### P2.1 Integration foundation
- Provider abstraction for Google, Meta, social and automation connectors
- Central connection status model
- Secure server-side credential handling
- Read-only mode by default
- Sync job model with timestamps and error state

### P2.2 Google Ads
- Accounts and customer IDs
- Campaigns, ad groups, ads
- Spend, impressions, clicks, conversions
- Campaign status
- Daily sync
- CRM attribution using gclid/UTM values

### P2.3 Meta Ads
- Ad accounts, campaigns, ad sets and ads
- Spend, reach, impressions, clicks and lead metrics
- Meta Lead Ads ingestion
- Campaign/ad/creative IDs stored against leads
- CRM attribution using fbclid/UTM values

### P2.4 Social media
- Connected account registry
- Content calendar
- Draft / approved / scheduled / published states
- Publishing adapter layer for supported providers
- Analytics ingestion
- Postiz-compatible integration path

### P2.5 Attribution
- First-touch and last-touch fields
- utm_source, utm_medium, utm_campaign, utm_content
- landing_page, referrer, gclid, fbclid
- Campaign → Lead → Opportunity → Client → Revenue linkage

### P2.6 Automation
- Event-driven hooks from CRM and integrations
- n8n-compatible webhook layer
- Lead routing
- Follow-up reminders
- Meta lead → CRM automation
- GSC/ads anomaly → task or alert

### P2.7 Reporting
- Marketing overview
- Spend by channel
- Leads by source
- CPL, CAC and ROAS
- Qualified lead rate
- Revenue by campaign

## Guardrails
- No credentials in source control
- OAuth tokens remain server-side
- Start read-only for ad platforms
- Write actions require explicit permission and auditing
- All sync operations must be idempotent where possible
