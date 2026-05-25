#!/bin/bash
# Rename the current branch to "default" and push (one repo at a time).
# Run from inside a repo:  bash /path/to/rename_branch_to_default.sh
# Or:  bash rename_branch_to_default.sh /path/to/repo
set -e

REPO="${1:-.}"
cd "$REPO"
OLD=$(git branch --show-current)

if [ "$OLD" = "default" ]; then
  echo "Already on default in $(pwd)"
  git push -u origin default 2>/dev/null || true
  exit 0
fi

echo "Renaming $OLD -> default in $(pwd)"
git branch -m "$OLD" default
git push -u origin default
echo "Done. Set GitHub default branch to 'default' and delete remote '$OLD' when ready."
