#!/usr/bin/env bash
# PostToolUse(Write|Edit) advisory check for trichome .ts/.tsx files.
# Fast grep-based nudges for mechanical CLAUDE.md rules.
# Non-blocking: emits findings as additionalContext; silent on a clean file.
set -euo pipefail

input=$(cat)
f=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$f" ] && exit 0
case "$f" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
case "$f" in
  */src/*) ;;
  *) exit 0 ;;
esac
[ -f "$f" ] || exit 0

findings=()

lines=$(wc -l < "$f" | tr -d ' ')
if [ "$lines" -gt 600 ]; then
  findings+=("File is ${lines} lines (>600) — flag for extraction.")
fi

if grep -qE 'console\.(log|debug)' "$f"; then
  n=$(grep -cE 'console\.(log|debug)' "$f")
  findings+=("${n} console.log/debug call(s) — remove before commit (no dead code).")
fi

if grep -qE ':[[:space:]]*any\b|as any\b' "$f"; then
  n=$(grep -cE ':[[:space:]]*any\b|as any\b' "$f")
  findings+=("${n} use(s) of \`any\` — replace with a real type (no any).")
fi

if grep -qE '"(sk|pk)_(live|test)_[A-Za-z0-9]+"' "$f"; then
  findings+=("Hardcoded Paystack API key literal — use process.env.PAYSTACK_SECRET_KEY / process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY instead (never hardcode secrets).")
fi

[ ${#findings[@]} -eq 0 ] && exit 0

msg="edit-check on $(basename "$f"):"
for x in "${findings[@]}"; do
  msg="$msg"$'\n'"- $x"
done

jq -nc --arg ctx "$msg" \
  '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx},suppressOutput:true}'
