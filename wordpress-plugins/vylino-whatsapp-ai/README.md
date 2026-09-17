# Vylino WhatsApp AI CRM

**Version:** 0.1.0  
**Author:** Archana / Vylino  
**Website:** https://www.vylino.com/  
**License:** GNU GPL v3 or later

Vylino WhatsApp AI CRM is a WordPress-native foundation for professional WhatsApp customer conversations, CRM records, AI-assisted replies, lead qualification, and safe real-time human handoff through Meta's official WhatsApp Cloud API.

## Phase 1 included

- Meta webhook verification and `X-Hub-Signature-256` validation.
- Incoming WhatsApp message ingestion.
- Outbound one-to-one text messages through the official Cloud API.
- WordPress-native contacts, conversations, message history and audit events.
- Basic deals, follow-up and approved-knowledge tables for the sales layer.
- WordPress admin dashboard and shared inbox view.
- AI/human conversation state.
- Manual **Take Over** and **Return to AI** controls.
- Configurable keyword-based human escalation.
- Email notification when a handoff is requested.
- Provider-independent AI integration using the `vylino_wa_generate_reply` filter.

## Safety model

AI is not allowed to be the final authority for pricing, discounts, contractual commitments or unsupported service claims. The intended architecture supplies approved Vylino knowledge to an AI adapter and pauses automation when a human takes over.

## Meta setup

After activation, go to **Vylino WhatsApp > Settings** and configure Graph API version, Phone Number ID, Business Account ID, access token, App Secret and Verify Token. The webhook callback URL is shown on the dashboard.

> Keep API credentials server-side. Never place access tokens or App Secrets in frontend JavaScript.

## AI adapter contract

AI is deliberately disabled in the first secure base until a provider adapter is configured. An adapter can use the `vylino_wa_generate_reply` filter and return a reply string or `WP_Error`.

## Human handoff

An agent can click **Take Over** at any time. Once a conversation is in `human` state, AI generation is blocked until an authorized user clicks **Return to AI**.

## License

Copyright (c) 2026 Archana / Vylino. This project is free software licensed under the GNU General Public License v3 or later.
