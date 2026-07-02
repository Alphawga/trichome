#!/usr/bin/env bash
# Stop hook — runs the Learning Loop checkpoint at session end.
# One-shot (never loops) and only fires when the working tree actually changed,
# so pure Q&A sessions stop normally. See "## Learning Loop" in CLAUDE.md.
set -euo pipefail

input=$(cat)

# Avoid re-blocking: if we already nudged this stop, let it through.
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false')
[ "$active" = "true" ] && exit 0

repo=$(printf '%s' "$input" | jq -r '.cwd // empty')
[ -z "$repo" ] && repo="/Users/alpha/trichome"
command -v git >/dev/null 2>&1 || exit 0

# Only nudge when code/docs/schema changed in this repo.
changes=$(git -C "$repo" status --porcelain -- src prisma docs 2>/dev/null | head -1 || true)
[ -z "$changes" ] && exit 0

read -r -d '' reason <<'EOF' || true
Learning checkpoint (the working tree changed this session). Before stopping, run it:
1. Did the user correct a detail or state a preference? → write/update a feedback_*.md memory (auto-capture), and add a one-line MEMORY.md pointer.
2. Was a correction mechanically checkable (a grep-able rule)? → add a rule to .claude/hooks/edit-check.sh.
3. Did you work a module deeply for the first time with ≥3 non-obvious facts and no skill yet (checkout, loyalty, admin permissions…)? → PROPOSE creating a `<module>` skill (ask first).
4. Did a skill's guidance turn out wrong? → fix that skill and note "changed X because Y".
5. Did new patterns/rules emerge? → update memory in ~/.claude/projects/-Users-alpha-trichome/memory/ (local memory is the resume point across sessions).
If nothing new was learned, just stop.
EOF

jq -nc --arg r "$reason" '{decision:"block", reason:$r}'
