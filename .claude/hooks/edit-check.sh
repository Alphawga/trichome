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

if grep -qE '"sb_(prod|sandbox)_[A-Za-z0-9]+"' "$f"; then
  findings+=("Hardcoded Shipbubble API key literal — use process.env.SHIPBUBBLE_API_KEY instead (never hardcode secrets).")
fi

if grep -qE '\$queryRaw|Prisma\.sql' "$f" && grep -qE "\\\\[sSdDwW]\+?'" "$f"; then
  findings+=("Raw SQL string literal contains a backslash regex shorthand (\\s/\\d/\\w) — this DB's string-literal handling silently drops the backslash, turning e.g. '\\s+' into literal 's+'. Use POSIX bracket classes instead, e.g. '[[:space:]]+'.")
fi

case "$f" in
  */src/server/modules/*.ts)
    if grep -qE '^export (async function|function)\b' "$f"; then
      findings+=("Plain function export in src/server/modules/ — every export in this directory is spread wholesale into appRouter (server/index.ts), and a non-procedure export breaks the router's type inference for the WHOLE FILE (cryptic 'not callable' errors on unrelated procedures). Move shared logic to src/lib/ instead — see the promotions skill's 'Eligibility/discount logic lives outside src/server/modules/ on purpose' section.")
    fi
    ;;
esac

[ ${#findings[@]} -eq 0 ] && exit 0

msg="edit-check on $(basename "$f"):"
for x in "${findings[@]}"; do
  msg="$msg"$'\n'"- $x"
done

jq -nc --arg ctx "$msg" \
  '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx},suppressOutput:true}'
