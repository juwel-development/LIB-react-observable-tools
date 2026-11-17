---
name: orca-implement
description: Orchestrate a spec's ticket DAG via Orca supervised workers — frontier-only dispatch, per-ticket /code-review, merges landing on the local main.
disable-model-invocation: true
---

# Orca-orchestrated spec implementation

Implement a published spec's tickets as an Orca-supervised worker DAG. You are the coordinator: you dispatch, gate, and merge — workers implement and review. Only **frontier** tickets — every blocker closed and merged — are ever dispatched; each merge lands on the **local** `main`, and pushing to origin stays a human act.

## 1. Load the ground rules

- Read Orca's own guide before any orchestration call: `orca skills get orchestration`. It is version-matched to the installed CLI and is the source of truth for command syntax and the supervised worker loop.
- Confirm the runtime is up: `orca status --json`.
- Confirm the primary checkout sits on `main` and is clean — it is the merge target.
- The issue tracker conventions (`docs/agents/issue-tracker.md`) define how to read tickets, blocking edges, and the board.

## 2. Build the ticket DAG

From the spec the user named (issue number or URL):

- Fetch the spec body, then its child tickets — sub-issues, the task list in the body, or issues referencing the spec.
- For each open ticket, fetch its blocking edges: native dependencies (`issue_dependencies_summary.blocked_by`), falling back to a `Blocked by:` body line.
- Present the DAG as waves — wave 1 has no blockers, wave 2 is blocked only by wave 1, and so on — and get the user's go before spawning anything.

## 3. Mirror the DAG into Orca

- `orca orchestration run-create` — one Run for the whole spec.
- Per ticket, two tasks: `implement #N` and `review #N`. Wire `--deps` so `review #N` depends on `implement #N`, and each `implement #M` depends on the `review` task of every ticket blocking #M.

## 4. Work the frontier

Loop until every task settles. `task-list --ready` names the dispatchable tasks; two gates bind every implement dispatch:

- **Frontier gate** — every GitHub blocker of the ticket is closed, including blockers outside this spec that never entered the DAG.
- **Merge gate** — the branches of its blocking tickets are already merged into the local `main`, so its worktree is born containing them.

Dispatch — one worktree per ticket: every ticket gets its own `ticket-<N>` worktree, shared by nothing but its own implement and review tasks:

- **Implement** — `worker-start` in a fresh top-level worktree cut from the local main: `--worktree new-top-level --name ticket-<N> --base-branch main --agent claude`. Set the board: `scripts/set-status.sh <N> "In Progress"`. Brief the worker: follow `/implement` for ticket #N; a separate reviewer handles the review step; commit to the current branch and report what changed.
- **Review** — on the implement task's `worker_done`, release that worker and `worker-start` the review task in the same `ticket-<N>` worktree with a fresh agent (fresh eyes). Set the board to `"In Review"`. Brief the reviewer: run `/code-review` on the diff against the branch's merge-base with `main`, using ticket #N and the spec as the spec source; apply the confirmed findings; commit.

While waiting, run the guide's rolling `check --wait` loop: answer `question`s, handle `escalation`s, and treat timeouts as checkpoints, not failures.

## 5. Merge each finished ticket

On a review task's `worker_done`, land the branch from the primary checkout:

1. `git merge ticket-<N> --no-edit`; resolve conflicts with `/resolving-merge-conflicts`.
2. `npm run build && npm run lint && npm run typecheck && npm run test` — fix what breaks before touching the next branch.
3. Close the ticket and move the board: `gh issue close <N> --comment "Completed by /orca-implement"`, then `scripts/set-status.sh <N> "Done"`.
4. Release the reviewer, remove the worktree, recompute the frontier, and dispatch what the merge unblocked.

The merge stays on the local `main` — pushing to origin is the human's act, always.

## 6. Account for every ticket

The Run ends only when every open child ticket is accounted for: **merged** (issue closed, board Done), **blocked** (name the open blocker), or **escalated** (name the reason). Release every settled worker, then report the table — ticket, outcome, branch, what remains — and state that nothing was pushed.
