#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=6144}"

# Hostinger's managed installer currently invokes Yarn with a legacy
# --non-interactive option. The app root therefore uses a tiny npm wrapper.
# Here we invoke the repository-pinned Yarn 4 binary directly.
YARN4=(node .yarn/releases/yarn-4.13.0.cjs)

# Install only the workspaces needed for the Vylino/Twenty runtime and build.
"${YARN4[@]}" workspaces focus \
  twenty \
  twenty-server \
  twenty-emails \
  twenty-shared \
  twenty-client-sdk \
  twenty-front \
  twenty-front-component-renderer \
  twenty-ui \
  twenty-sdk

"${YARN4[@]}" nx run twenty-server:lingui:extract
"${YARN4[@]}" nx run twenty-server:lingui:compile
"${YARN4[@]}" nx run twenty-emails:lingui:extract
"${YARN4[@]}" nx run twenty-emails:lingui:compile
"${YARN4[@]}" nx run twenty-front:lingui:extract
"${YARN4[@]}" nx run twenty-front:lingui:compile

"${YARN4[@]}" nx build twenty-front
"${YARN4[@]}" nx build twenty-server

rm -rf "${SCRIPT_DIR}/dist"
mkdir -p "${SCRIPT_DIR}/dist"
cp -R packages/twenty-server/dist/. "${SCRIPT_DIR}/dist/"
rm -rf "${SCRIPT_DIR}/dist/front"
cp -R packages/twenty-front/build "${SCRIPT_DIR}/dist/front"
cp "${SCRIPT_DIR}/launcher.mjs" "${SCRIPT_DIR}/dist/hostinger-launcher.mjs"

echo "Hostinger managed Vylino build completed."
