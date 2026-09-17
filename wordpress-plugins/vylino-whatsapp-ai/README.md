# Vylino WhatsApp AI CRM

**Version:** 0.2.0  
**Author:** Archana / Vylino  
**Website:** https://www.vylino.com/  
**License:** GNU GPL v3 or later

Vylino WhatsApp AI CRM is a WordPress-native system for WhatsApp customer conversations, CRM records, AI-assisted replies and safe real-time human handoff through Meta's official WhatsApp Cloud API.

## Phase 1 implemented

- Meta webhook verification and `X-Hub-Signature-256` validation.
- Incoming WhatsApp message ingestion and outbound one-to-one text messages.
- Contacts, conversations, message history, knowledge, deals, follow-ups and audit-event schema.
- WordPress admin dashboard, settings and inbox.
- Google Gemini Interactions API adapter using `store=false`.
- Default Gemini model `gemini-3.6-flash`, configurable in WordPress.
- AI/human conversation state and configurable keyword escalation.
- Manual **Take Over** and **Return to AI** controls.
- Human agent reply composer; any human reply automatically pauses AI.
- Email notification when human handoff is requested.

## Safety model

AI is not the final authority for custom pricing, discounts, contractual commitments, guarantees or unsupported service claims. The prompt restricts AI to approved Vylino knowledge stored in the plugin. When a human takes over, automated AI replies are blocked for that conversation until an authorized user returns it to AI.

## Privacy

Gemini requests use the Interactions API with `store=false`; the plugin maintains customer conversation history in WordPress. Site operators remain responsible for privacy notices, lawful processing, customer consent where required, retention policy, WhatsApp Business policy compliance and Gemini/API terms.

## Setup

1. Activate the plugin.
2. Configure Meta WhatsApp Cloud API credentials in **Vylino WhatsApp > Settings**.
3. Configure the callback URL shown on the plugin dashboard in Meta and subscribe to message events.
4. Add a Gemini API key.
5. Add approved Vylino service information to the knowledge table/UI as that module is expanded.
6. Test on a non-production number before enabling automatic AI replies.

## License

Copyright (c) 2026 Archana / Vylino. Licensed under GNU GPL v3 or later.
