# Vylino WordPress / Elementor Lead Capture Integration

## Goal
Capture marketing attribution at the website entry point and preserve it through Elementor lead forms into Vylino CRM and n8n.

## Browser-side capture
Capture these values from the landing URL when present:
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term
- gclid
- fbclid
- landing_page
- referrer

Store first-touch attribution in browser storage and inject the values into hidden Elementor form fields before submission.

## Elementor form fields
Visible fields can remain simple: name, email, phone, service/requirement and message. Attribution fields should be hidden and populated automatically.

Recommended hidden field IDs:
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term
- gclid
- fbclid
- landing_page
- referrer

## Submission processing
Use `buildElementorWebhookPayload()` to normalize Elementor submissions. The resulting payload contains a standard Vylino lead object plus the original WordPress submission context.

## Webhook boundary
Use `buildWordPressLeadWebhookRequest()` before sending the lead to the Vylino backend or n8n ingress. The request includes a deterministic idempotency key to reduce duplicate lead creation.

Do not place CRM, n8n, Google, Meta, or other API secrets in browser JavaScript or Elementor hidden fields. The browser should only capture non-secret attribution data; authenticated forwarding must happen server-side.

## Target flow
WordPress/Elementor -> normalized lead webhook -> Vylino backend/n8n -> CRM lead/person -> opportunity -> attributed revenue.
