#!/usr/bin/env bash
#
# Post a short "Claude finished" summary to Slack.
#
# Wired to two hook events in .claude/settings.json:
#   UserPromptSubmit -> stamps when the turn started
#   Stop             -> posts, but only if the turn ran longer than the threshold
#
# The threshold is the whole point. A Slack ping for every "yes, that helper is
# on line 40" trains you to ignore the channel within a day. Only turns long
# enough that you have probably walked away are worth an interrupt.
#
# The webhook URL comes from $SLACK_WEBHOOK_URL, or from ~/.claude/slack-webhook
# if that is unset. With neither, this exits quietly — an unconfigured hook must
# never be the thing that breaks a session.
set -euo pipefail

THRESHOLD_SECONDS="${SLACK_NOTIFY_AFTER_SECONDS:-120}"

payload=$(cat)
event=$(jq -r '.hook_event_name // ""' <<<"$payload")
session=$(jq -r '.session_id // "unknown"' <<<"$payload")
stamp="${TMPDIR:-/tmp}/claude-slack-${session}.start"

if [[ "$event" == "UserPromptSubmit" ]]; then
  date +%s >"$stamp"
  exit 0
fi

# --- Stop ---------------------------------------------------------------------

# No stamp means this Stop had no matching UserPromptSubmit (a resumed session,
# a hook added mid-turn). Nothing to measure, so say nothing.
[[ -f "$stamp" ]] || exit 0
started=$(<"$stamp")
rm -f "$stamp"

elapsed=$(($(date +%s) - started))
((elapsed >= THRESHOLD_SECONDS)) || exit 0

webhook="${SLACK_WEBHOOK_URL:-}"
if [[ -z "$webhook" && -r "$HOME/.claude/slack-webhook" ]]; then
  webhook=$(<"$HOME/.claude/slack-webhook")
fi
[[ -n "$webhook" ]] || exit 0

# last_assistant_message is the finished response text — the docs steer you here
# rather than to the transcript, which can lag the turn that just ended.
summary=$(jq -r '.last_assistant_message // ""' <<<"$payload" | tr '\n' ' ' | cut -c1-280)
project=$(basename "$(jq -r '.cwd // "."' <<<"$payload")")
minutes=$((elapsed / 60))

# Build the body with jq so a stray quote or backslash in the summary cannot
# produce malformed JSON.
body=$(jq -n \
  --arg text ":robot_face: *${project}* — Claude finished after ${minutes}m" \
  --arg summary "$summary" \
  '{text: $text, blocks: [
      {type: "section", text: {type: "mrkdwn", text: $text}},
      {type: "context", elements: [{type: "mrkdwn", text: $summary}]}
    ]}')

curl -fsS -X POST -H 'content-type: application/json' --max-time 10 \
  --data "$body" "$webhook" >/dev/null || true
