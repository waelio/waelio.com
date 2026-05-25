#!/bin/bash
# Publish Wave 1 metadata fixes. Requires: npm whoami works.
set -e

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
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

publish_pkg() {
  local dir="$1"
  cd "$ROOT/$dir"
  local name version
  name=$(node -p "require('./package.json').name")
  version=$(node -p "require('./package.json').version")
  echo ""
  echo ">>> $name@$version ($dir)"
  echo "  npm install..."
  npm install
  if grep -q '"build":' package.json 2>/dev/null; then
    echo "  npm run build..."
    npm run build
  fi
  if [ -n "${NPM_OTP:-}" ]; then
    npm publish --access public --otp="$NPM_OTP"
  else
    npm publish --access public
  fi
  echo "Published $name@$version"
}

publish_pkg waelio-messaging
publish_pkg cli
publish_pkg data
publish_pkg builder

echo ""
echo "Wave 1 publish complete."
