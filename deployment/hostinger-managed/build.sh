#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

corepack enable || true

# Hostinger installs dependencies before the build step when Yarn is selected.
# Keep this script focused on compiling the Vylino/Twenty application.
yarn nx run twenty-server:lingui:extract
yarn nx run twenty-server:lingui:compile
yarn nx run twenty-emails:lingui:extract
yarn nx run twenty-emails:lingui:compile
yarn nx run twenty-front:lingui:extract
yarn nx run twenty-front:lingui:compile

yarn nx build twenty-front
yarn nx build twenty-server

rm -rf packages/twenty-server/dist/front
cp -R packages/twenty-front/build packages/twenty-server/dist/front
cp deployment/hostinger-managed/launcher.mjs packages/twenty-server/dist/hostinger-launcher.mjs

echo "Hostinger managed build completed."
