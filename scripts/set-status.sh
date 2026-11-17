#!/usr/bin/env bash
# Set the React Observable Tools board status for one issue.
#
# Usage: scripts/set-status.sh <issue-number> "<status>"
#   <status> is one of: "To Do" | "In Progress" | "In Review" | "Done"
#
# Pinned to GitHub Project #2 ("React Observable Tools"), owned by the juwel-development
# ORGANISATION — not the juwel-dev user account that owns the boards of other repositories
# in this workspace. Node id PVT_kwDOCiHRXs4BgPtH.
#
# The ids are pinned here rather than resolved by name because `--project` matches on
# a title string: the moment a second board shares or nearly shares that title, `gh`
# picks between them silently. Never pass --project to `gh issue create`; call this
# script instead.
#
# This adds the issue to the board when it isn't on it yet (see item-add below), so
# for a freshly created issue this one call is the whole job.
#
# Requires a gh token with "Projects (Read and write)" on the juwel-development org.
set -euo pipefail

ISSUE="${1:?usage: set-status.sh <issue-number> <status>}"
STATUS="${2:?usage: set-status.sh <issue-number> <status>}"

OWNER="juwel-development"
PROJECT_NUMBER=2
PROJECT_ID="PVT_kwDOCiHRXs4BgPtH"
STATUS_FIELD_ID="PVTSSF_lADOCiHRXs4BgPtHzhacyxk"

case "$STATUS" in
  "To Do")       OPTION_ID="f75ad846" ;;
  "In Progress") OPTION_ID="47fc9ee4" ;;
  "In Review")   OPTION_ID="cba5bc73" ;;
  "Done")        OPTION_ID="98236657" ;;
  *) echo "set-status: unknown status '$STATUS' (want To Do|In Progress|In Review|Done)" >&2; exit 1 ;;
esac

# Resolve the project item for this issue; add it to the board if it isn't on it yet.
item_id="$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 500 \
  | jq -r --arg n "$ISSUE" 'first(.items[] | select(.content.number == ($n | tonumber)) | .id) // empty')"

if [ -z "$item_id" ]; then
  url="$(gh issue view "$ISSUE" --json url --jq .url)"
  item_id="$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" --format json | jq -r .id)"
fi

gh project item-edit \
  --project-id "$PROJECT_ID" \
  --id "$item_id" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$OPTION_ID" >/dev/null

echo "set-status: #$ISSUE -> $STATUS"
