# Vylino Development Workflow

## Branching
- `main`: stable baseline only.
- `develop`: integrated development branch.
- `feature/<name>`: individual implementation work.
- `fix/<name>`: bug fixes.

## Initial Feature Branches
- `feature/vylino-branding`
- `feature/vylino-navigation`
- `feature/crm-sales`
- `feature/projects`
- `feature/seo-workspace`
- `feature/search-console`
- `feature/ga4`
- `feature/wordpress`

## Rules
1. Avoid editing Twenty core unless an extension point cannot satisfy the requirement.
2. Prefer Twenty SDK objects, views, apps and custom fields.
3. Keep external credentials outside source control.
4. Use environment variables for OAuth/API settings.
5. Start integrations as read-only wherever practical.
6. Add write actions only with explicit permission checks and auditability.
7. Preserve upstream compatibility so the fork can receive Twenty updates.

## Pull Request Flow
Feature branch → pull request → `develop` → validation → later release to `main`.

## First Implementation Target
Create the Vylino app shell and navigation structure, then configure CRM/sales fields before starting external integrations.
