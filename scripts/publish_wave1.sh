#!/bin/bash
# Publish Wave 1 metadata fixes. Requires: npm whoami works.
# Skips packages already on npm at the same version (no double publish).
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=publish_lib.sh
source "$SCRIPT_DIR/publish_lib.sh"

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: npm whoami failed. In Chrome create a Publish token, then:"
  echo '  npm config set //registry.npmjs.org/:_authToken=YOUR_FULL_TOKEN'
  echo "  npm whoami"
  exit 1
fi

if [ -z "${NPM_OTP:-}" ]; then
  echo "Tip: if publish asks for 2FA, run: NPM_OTP=123456 bash $0"
fi

echo "Publishing as $(npm whoami)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

publish_pkg() {
  local dir="$1"
  cd "$ROOT/$dir"
  local name version
  name=$(node -p "require('./package.json').name")
  version=$(node -p "require('./package.json').version")
  echo ""
  echo ">>> $name@$version ($dir)"

  if npm_version_already_published "$name" "$version"; then
    echo "  SKIP: already published on npm (no republish)"
    return 0
  fi

  npm_install_deps
  npm_build_if_needed
  npm_publish_package
  echo "Published $name@$version"
}

publish_pkg waelio-messaging
publish_pkg cli
publish_pkg data

echo ""
echo "Wave 1 complete (messaging, cli, data). Skipped any version already on npm."
echo "For @waelio/builder only: bash scripts/publish_builder.sh"
