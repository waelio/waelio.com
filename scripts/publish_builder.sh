#!/bin/bash
# Publish @waelio/builder only (uses pnpm). Requires: npm whoami works.
# Skips if this version is already on npm (no double publish).
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=publish_lib.sh
source "$SCRIPT_DIR/publish_lib.sh"

if ! npm whoami >/dev/null 2>&1; then
  echo "ERROR: npm whoami failed."
  exit 1
fi

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT/builder"

name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")

echo "Publishing $name@$version as $(npm whoami)"

if npm_version_already_published "$name" "$version"; then
  echo "SKIP: $name@$version already on npm (no republish)"
  exit 0
fi

npm_install_deps
npm_build_if_needed
npm_publish_package
echo "Published $name@$version"
