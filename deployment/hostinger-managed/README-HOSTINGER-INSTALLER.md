# Hostinger managed installer compatibility

Hostinger Business automatically installs dependencies before running the custom build command. The production Vylino monorepo uses Yarn 4, while Hostinger currently invokes Yarn with a legacy `--non-interactive` option. The `deploy/crm-vylino-hostinger` branch therefore presents a minimal npm package at repository root for Hostinger's automatic install, then `deployment/hostinger-managed/build.sh` restores the real Twenty/Vylino package manifest and lockfile and invokes the repository-pinned Yarn 4 binary directly.

Do not merge the root bootstrap package changes back into development branches; they are deployment packaging only.
