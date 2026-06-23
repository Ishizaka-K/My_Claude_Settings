#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
PROMPT_FILE="${2:-}"
WORKDIR="${CODEX_WORKDIR:-$PWD}"

if [[ -z "$MODE" || -z "$PROMPT_FILE" ]]; then
  echo "Usage: scripts/ai-harness/codex_cli.sh <mode> <prompt-file> [input-file ...]" >&2
  exit 2
fi

if [[ ! "$MODE" =~ ^(review|ask|prototype-patch|task-worker|bug-analysis|bug-fix-worker|integration-worker|compare)$ ]]; then
  echo "Invalid mode: $MODE" >&2
  echo "Allowed modes: review, ask, prototype-patch, task-worker, bug-analysis, bug-fix-worker, integration-worker, compare" >&2
  exit 2
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 2
fi

shift 2

REQUEST_FILE="$(mktemp)"
OUTPUT_FILE="$(mktemp)"
trap 'rm -f "$REQUEST_FILE" "$OUTPUT_FILE"' EXIT

{
  echo "# Mode"
  echo
  echo "$MODE"
  echo
  echo "# Prompt"
  echo
  cat "$PROMPT_FILE"
  echo
  echo "# Inputs"
  echo
  if [[ "$#" -eq 0 ]]; then
    echo "No additional input files."
  fi

  for input_file in "$@"; do
    if [[ ! -f "$input_file" ]]; then
      echo "Input file not found: $input_file" >&2
      exit 2
    fi

    echo
    echo "## File: $input_file"
    echo
    echo '```'
    cat "$input_file"
    echo
    echo '```'
  done
} > "$REQUEST_FILE"

SANDBOX_MODE="read-only"
if [[ "$MODE" == "task-worker" || "$MODE" == "bug-fix-worker" || "$MODE" == "integration-worker" ]]; then
  SANDBOX_MODE="workspace-write"
fi

if [[ "$SANDBOX_MODE" == "workspace-write" && -z "${CODEX_WORKDIR:-}" ]]; then
  echo "CODEX_WORKDIR is required for writable mode: $MODE" >&2
  exit 2
fi

if [[ ! -d "$WORKDIR" ]]; then
  echo "CODEX_WORKDIR is not a directory: $WORKDIR" >&2
  exit 2
fi

if [[ "$MODE" == "task-worker" || "$MODE" == "bug-fix-worker" ]]; then
  GIT_DIR="$(git -C "$WORKDIR" rev-parse --path-format=absolute --git-dir 2>/dev/null || true)"
  GIT_COMMON_DIR="$(git -C "$WORKDIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"

  if [[ -z "$GIT_DIR" || -z "$GIT_COMMON_DIR" || "$GIT_DIR" == "$GIT_COMMON_DIR" ]]; then
    echo "$MODE must run in a linked Git worktree: $WORKDIR" >&2
    exit 2
  fi
fi

STATUS_INTERVAL_SECONDS="${CODEX_STATUS_INTERVAL_SECONDS:-1}"
STATUS_WINDOW_SECONDS="${CODEX_STATUS_WINDOW_SECONDS:-10}"

if [[ ! "$STATUS_INTERVAL_SECONDS" =~ ^[1-9][0-9]*$ || ! "$STATUS_WINDOW_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
  echo "Status interval and window must be positive integers" >&2
  exit 2
fi

echo "[codex_cli] starting mode=$MODE sandbox=$SANDBOX_MODE approval=never" >&2

codex exec \
  --ask-for-approval never \
  --sandbox "$SANDBOX_MODE" \
  --cd "$WORKDIR" \
  - < "$REQUEST_FILE" > "$OUTPUT_FILE" 2>&1 &

CODEX_PID="$!"
ELAPSED=0

while kill -0 "$CODEX_PID" 2>/dev/null; do
  if [[ "$ELAPSED" -ge "$STATUS_WINDOW_SECONDS" ]]; then
    break
  fi

  sleep 1
  ELAPSED=$((ELAPSED + 1))

  if [[ $((ELAPSED % STATUS_INTERVAL_SECONDS)) -eq 0 ]] && kill -0 "$CODEX_PID" 2>/dev/null; then
    echo "[codex_cli] still running mode=$MODE elapsed=${ELAPSED}s" >&2
  fi
done

set +e
wait "$CODEX_PID"
STATUS="$?"
set -e

FINAL_STATE="complete"
if [[ "$STATUS" -ne 0 ]]; then
  FINAL_STATE="failed"
elif [[ "$MODE" == "task-worker" || "$MODE" == "bug-fix-worker" || "$MODE" == "integration-worker" ]]; then
  if grep -Eq '^CODEX_RESULT: COMPLETE[[:space:]]*$' "$OUTPUT_FILE"; then
    FINAL_STATE="complete"
  elif grep -Eq '^CODEX_RESULT: BLOCKED[[:space:]]*$' "$OUTPUT_FILE"; then
    FINAL_STATE="blocked"
    STATUS=3
  elif grep -Eq '^CODEX_RESULT: FAILED[[:space:]]*$' "$OUTPUT_FILE"; then
    FINAL_STATE="failed"
    STATUS=4
  else
    FINAL_STATE="finished-unconfirmed"
    STATUS=5
  fi
fi

cat "$OUTPUT_FILE"
echo "[codex_cli] finished mode=$MODE state=$FINAL_STATE exit=$STATUS" >&2
exit "$STATUS"
