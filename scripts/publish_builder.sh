#!/bin/bash
# Publish @waelio/builder only (uses pnpm). Requires: npm whoami works.
set -e

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: npm whoami failed."
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/builder"

echo "Publishing @waelio/builder as $(npm whoami)"
pnpm install
pnpm run build
if [ -n "${NPM_OTP:-}" ]; then
  npm publish --access public --otp="$NPM_OTP"
else
  npm publish --access public
fi
echo "Published @waelio/builder@$(node -p "require('./package.json').version")"
