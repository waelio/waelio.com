#!/bin/bash
# Verify package metadata and dry-run pack — does NOT publish.
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PACKAGES=(
  "cli"
  "data"
  "waelio-messaging"
  "ustore"
  "utils"
  "builder"
  "quasar-app-extension-waelio"
)

echo "Verifying packages under $ROOT"
echo "----------------------------------------"

for pkg in "${PACKAGES[@]}"; do
  dir="$ROOT/$pkg"
  [ -d "$dir" ] || { echo "SKIP $pkg (no dir)"; continue; }
  cd "$dir"
  name=$(node -p "require('./package.json').name")
  ver=$(node -p "require('./package.json').version")
  echo ""
  echo "== $name@$ver ($pkg) =="
  if node -e "const p=require('./package.json'); if(p.dependencies&&p.dependencies[p.name]) process.exit(1)" 2>/dev/null; then
    echo "  OK: no self-dependency"
  else
    echo "  FAIL: self-dependency in dependencies"
    exit 1
  fi
  if [ -f package.json ] && grep -q '"build":' package.json; then
    echo "  build..."
    npm run build --if-present 2>/dev/null || npm run build
  fi
  echo "  npm pack --dry-run..."
  npm pack --dry-run
done

echo ""
echo "All verified (dry-run only). Publish manually after: npm whoami"
