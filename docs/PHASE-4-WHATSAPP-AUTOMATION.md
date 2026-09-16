# Phase 4 — WhatsApp Automation

## Goal

Add a production-safe WhatsApp sales and support automation layer to Vylino Business OS without creating a second CRM.

## Transport strategy

1. **Primary production transport:** Meta WhatsApp Cloud API.
2. **Optional self-hosted gateway:** Evolution API, deployed separately and connected through REST/webhooks. It may be used with its official Cloud API mode or, where explicitly accepted, its WhatsApp Web/Baileys mode.
3. Transport selection is provider-agnostic inside Vylino so the CRM objects, automation rules, payments and dashboards do not depend on one gateway.

## Compliance defaults

- Automation is intended for inbound/customer-service conversations.
- Free-form automated replies are allowed only while the customer-service window is open.
- Outside that window, outbound messages must use approved templates when the official WhatsApp Business Platform requires them.
- STOP, UNSUBSCRIBE, CANCEL and similar opt-out intents must disable proactive messaging.
- Every automated flow must provide a clear human-handoff path.
- Broadcast/proactive campaigns remain disabled until opt-in and template controls are configured.

## Core CRM objects

### WhatsApp Conversation
Stores one CRM conversation per WhatsApp customer/number and tracks automation state, last intent, human handoff, recommendation and payment state.

### WhatsApp Message
Stores normalized inbound/outbound message events, delivery state and automation metadata.

### Service Catalog
Stores products/services that the recommendation engine can suggest. Vylino services can be preloaded here, and the model remains reusable for future businesses.

### Payment Request
Tracks generated payment links and payment lifecycle. Initial production provider is Cashfree, with the interface designed for additional providers.

## Target flow

Inbound WhatsApp message
→ verify webhook signature
→ normalize provider payload
→ identify/upsert Person in Twenty
→ find/create WhatsApp Conversation
→ persist inbound message
→ enforce opt-out and customer-service-window rules
→ classify intent
→ retrieve matching active catalog items
→ generate deterministic recommendation
→ optional AI phrasing/intent refinement
→ confidence/handoff gate
→ send reply through configured transport
→ persist outbound message and delivery status
→ when the customer confirms purchase/service: create payment request
→ generate Cashfree payment link
→ send link in WhatsApp
→ Cashfree webhook updates payment status
→ update Opportunity/CRM stage
→ dashboard reports conversations, automation, handoffs, recommendations and payments.

## Automation modes

- `BOT`: automation owns the conversation.
- `ASSISTED`: automation suggests replies, human can approve/send.
- `HUMAN`: automation does not send free-form replies.
- `PAUSED`: no automation.

## Human handoff triggers

- explicit request for a human/agent
- low intent confidence
- complaint/refund/legal/escalation intent
- repeated fallback responses
- unsupported payment issue
- operator takeover

## AI policy

AI is optional. Core routing, service matching, customer-service-window rules, opt-out, payment creation and handoff logic must work without an LLM. An AI provider may improve classification and wording but cannot bypass deterministic safety/business rules.

## Payment provider

Cashfree Payment Links is the initial provider. Credentials remain server-side. Payment webhooks update Payment Request records and can move linked opportunities after verified payment.

## Dashboard

A native `WhatsApp Automation` dashboard will show:

- open conversations
- bot-owned vs human-owned conversations
- messages sent/received
- handoff rate
- top intents
- top recommended categories
- payment links created
- paid/partial/failed payment state
- conversion from conversation → qualified lead → payment
- recent conversations requiring attention

## Delivery stages

### P4.1 — Data model and dashboard shell
Conversation, Message, Service Catalog and Payment Request objects, views and navigation.

### P4.2 — Transport layer
Meta Cloud API direct adapter + optional Evolution API adapter.

### P4.3 — Inbound webhook ingestion
Signature verification, idempotency, message normalization and CRM conversation persistence.

### P4.4 — Reply automation
Intent engine, catalog recommender, reply composer, service-window enforcement, opt-out and human handoff.

### P4.5 — Payments
Cashfree payment-link creation, payment webhooks and CRM stage update.

### P4.6 — Inbox/operator controls
Manual send, takeover/release, pause automation, assignment and conversation status.

### P4.7 — Advanced automation
Templates, approved outbound follow-up, reminders, abandoned-payment follow-up, multilingual replies, attachments, voice-note transcription and optional AI tools.

### P4.8 — Production validation
Cloud API/Evolution smoke tests, duplicate webhook replay, opt-out test, service-window test, payment sandbox test, security review and CI.
