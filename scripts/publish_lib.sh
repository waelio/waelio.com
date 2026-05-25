#!/bin/bash
# Shared helpers for publish scripts. Source from publish_wave1.sh / publish_builder.sh.

# Returns 0 if name@version is already on the npm registry.
npm_version_already_published() {
  local name="$1"
  local version="$2"
  local published
  published=$(npm view "${name}@${version}" version 2>/dev/null || true)
  [ "$published" = "$version" ]
}

# Install dependencies (pnpm if lockfile, else npm).
npm_install_deps() {
  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
    echo "  pnpm install..."
    pnpm install
  else
    echo "  npm install..."
    npm install
  fi
}

# Build once: skip if prepublishOnly will run build on publish.
npm_build_if_needed() {
  if grep -q '"prepublishOnly"' package.json 2>/dev/null; then
    echo "  skip build (prepublishOnly runs on publish)"
    return 0
  fi
  if ! grep -q '"build":' package.json 2>/dev/null; then
    return 0
  fi
  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
    echo "  pnpm run build..."
    pnpm run build
  else
    echo "  npm run build..."
    npm run build
  fi
}

npm_publish_package() {
  if [ -n "${NPM_OTP:-}" ]; then
    npm publish --access public --otp="$NPM_OTP"
  else
    npm publish --access public
  fi
}
