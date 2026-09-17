=== Vylino WhatsApp AI CRM ===
Contributors: vylino
Tags: whatsapp, crm, ai, customer-support, sales, whatsapp-cloud-api
Requires at least: 6.8
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 0.2.0
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

WordPress-native WhatsApp Cloud API inbox, CRM foundation, AI routing and human handoff for Vylino.

== Description ==
Vylino WhatsApp AI CRM connects WordPress to Meta's official WhatsApp Cloud API. Phase 1 provides a secure webhook endpoint, contact and conversation storage, message history, a WordPress inbox, Gemini-assisted replies, keyword-based escalation, and manual takeover/release controls.

== Installation ==
1. Upload the plugin folder or ZIP and activate it.
2. Open Vylino WhatsApp > Settings.
3. Add the Meta Phone Number ID, Business Account ID, access token and App Secret.
4. Copy the callback URL from the dashboard and use the Verify Token in Meta developer settings.
5. Subscribe the webhook to WhatsApp messages events.
6. Add a Gemini API key, keep `gemini-3.6-flash` or select another supported model, then enable AI replies after testing.

== Changelog ==
= 0.2.0 =
* Added Google Gemini Interactions API adapter using store=false.
* Added human agent reply composer.

= 0.1.0 =
* Initial Phase 1 foundation.
