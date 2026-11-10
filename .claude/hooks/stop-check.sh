#!/usr/bin/env bash
# Stop hook: blocks Claude from finishing while typecheck, lint or unit tests fail.
# Exit 0 = allow stop, exit 2 = block and feed stderr back to Claude.
set -uo pipefail

input=$(cat)

# Already continuing because of this hook: let Claude stop to avoid loops.
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

# Tests are being written before the implementation: failing tests are expected.
if [ -f .claude/.tests-first ]; then
  exit 0
fi

# Nothing changed since the last commit: nothing to check.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found, so the checks could not run. Ask the user to install Node.js 26 LTS (winget install OpenJS.NodeJS.LTS), then end your turn." >&2
  exit 2
fi

if ! output=$(timeout 100 npm run check 2>&1); then
  {
    echo "npm run check failed. Fix the problem before finishing (last 40 lines):"
    printf '%s\n' "$output" | tail -n 40
  } >&2
  exit 2
fi

exit 0
