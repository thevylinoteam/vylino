# Vylino Integrations Foundation

This package is the provider-agnostic integration layer for Phase 2 of Vylino Business OS.

It defines shared concepts for Google Ads, Meta Ads, social publishing, automation and future providers without storing provider credentials in source control.

## Principles

- Read-only first for advertising and analytics providers.
- Workspace-scoped connections.
- Server-side credentials only.
- Normalized sync states and error reporting.
- Attribution fields shared across CRM, ads and analytics.
- Provider-specific adapters implement the common contract.

## Initial providers

- Google Ads
- Meta Ads
- Postiz / social publishing
- n8n / automation

## Next steps

1. Wire this contract into a Twenty app package.
2. Add connection-provider implementations.
3. Add sync jobs and normalized marketing entities.
4. Add UI for connection state and last sync.
