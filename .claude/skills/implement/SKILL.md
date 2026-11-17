---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

You get a github ticket to work on.

Move the ticket to **In Progress** on the board before you write any code — the board is how anyone
else sees the ticket is taken:

```bash
scripts/set-status.sh <TICKET> "In Progress"
```

The script adds the ticket to the board if it isn't on it yet, so one call is the whole job. Never
use `gh issue edit --project`; the tracker doc (`docs/agents/issue-tracker.md`) says why.

Implement the work described by the user in the spec or tickets. You are already on the branch your
work belongs on — commit to it, and don't switch branches or start another one.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work. That is what moves the ticket to **In Review**, so
don't set the status yourself at the end.

Commit your work, with a message describing what you did and any relevant context.

Use conventional commit messages, and include the ticket number in the commit message.

**Never push, never merge, and never set the ticket to `Done`.** Landing the work belongs to
whoever merges the branch — a human, or `/orca-implement` when it merges onto the local `main`.
