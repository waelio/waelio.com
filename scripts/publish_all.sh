#!/bin/bash
# A script to automatically bump versions and publish all 8 waelio packages.

# Exit immediately if a command exits with a non-zero status
set -e

# Path to the parent directory containing all repositories
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PACKAGES=(
  "cli"
  "data"
  "waelio-messaging"
  "ustore"
  "utils"
  "quasar-app-extension-waelio"
  "waelio-utils"
)

echo "🚀 Starting bulk publish from $ROOT_DIR"
echo "--------------------------------------------------------"

for pkg in "${PACKAGES[@]}"; do
  echo "📦 Processing package: $pkg..."
  
  PKG_DIR="$ROOT_DIR/$pkg"
  
  if [ ! -d "$PKG_DIR" ]; then
    echo "⚠️  Directory $PKG_DIR does not exist. Skipping."
    continue
  fi
  
  cd "$PKG_DIR"
  
  # Agent is a special case where the package.json is actually inside frontend/
  if [ "$pkg" == "Agent" ] && [ -d "frontend" ]; then
    echo "   Moving into frontend/ directory for Agent..."
    cd frontend
  fi
  
  # Install dependencies to ensure build tools are available
  echo "   Installing dependencies..."
  if [ -f "pnpm-lock.yaml" ]; then
    pnpm install
  elif [ -f "yarn.lock" ]; then
    yarn install
  else
    npm install
  fi
  
  # Build if a build script exists and there is no prepublishOnly script
  # (prepublishOnly runs automatically during npm publish anyway)
  if grep -q '"build":' package.json && ! grep -q '"prepublishOnly":' package.json; then
    echo "   Building package..."
    npm run build
  fi
  
  PKG_NAME=$(node -p "require('./package.json').name")
  LOCAL_VERSION=$(node -p "require('./package.json').version")
  NPM_VERSION=$(npm show "$PKG_NAME" version 2>/dev/null || echo "0.0.0")
  
  echo "   Current Local: $LOCAL_VERSION | Published: $NPM_VERSION"

  # Only bump if the local version matches the published version
  if [ "$LOCAL_VERSION" == "$NPM_VERSION" ]; then
    echo "   Bumping patch version..."
    npm version patch --no-git-tag-version
  else
    echo "   Version already differs from NPM (likely bumped already). Skipping bump."
  fi
  
  # Publish to public registry
  echo "   Publishing to NPM..."
  npm publish --access public
  
  echo "✅ Successfully published $pkg!"
  echo "--------------------------------------------------------"
done

echo "🎉 All 8 packages have been successfully built, bumped, and published!"
