# Vylino Business OS Architecture

## Goal
Build a single-window business operating system for Vylino covering CRM, leads, sales, projects, SEO, analytics, ads, social media, website operations and automation.

## Platform Strategy
Use Twenty as the CRM foundation and extend it through Vylino-specific modules instead of rewriting Twenty core.

## Core Modules
- Executive Dashboard
- CRM
- Sales
- Clients
- Projects
- SEO
- Google Search Console
- GA4
- Google Ads
- Meta Ads
- Social Media
- Website / WordPress
- Analytics
- Automation
- Settings / Integrations

## Phase 1
1. Vylino branding and navigation
2. CRM fields and lead pipeline
3. Clients and projects
4. Unified dashboard
5. SEO module
6. Search Console integration
7. GA4 integration
8. WordPress integration

## Phase 2
1. Google Ads integration
2. Meta Ads integration
3. Lead attribution
4. Social publishing and scheduling
5. Email/WhatsApp workflows
6. n8n automation layer

## Phase 3
1. AI SEO assistant
2. AI content assistant
3. AI sales assistant
4. Lead scoring
5. Campaign analysis
6. Client portal
7. Multi-client agency workspace

## Technical Foundation
- Frontend: React / Vite
- Backend: NestJS
- API: GraphQL + REST integrations
- Database: PostgreSQL
- Queue / background jobs: Redis + BullMQ
- ORM: TypeORM
- Automation: n8n
- Optional BI: Metabase

## Design Principle
Keep upstream Twenty core changes minimal. Prefer Vylino-owned modules, extension points, custom objects and integrations so upstream updates remain manageable.
