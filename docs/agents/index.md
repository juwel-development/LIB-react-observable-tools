# Agents

This library is built by agents working against a planned frontier of tickets. This section
documents the substrate those agents operate on.

- **[Issue Tracker](./issue-tracker.md)** — how issues, sub-issues, blocking, and
  dependencies work as native GitHub Issues, which board they land on, and the identifiers
  each interface wants.
- **[Triage labels](./triage-labels.md)** — the mapping from the canonical triage roles the
  skills speak to the label strings the tracker stores.
- **[Standards](./standards/)** — `coding.md`, `architecture.md`, and `testing.md`. The
  `/code-review` Standards axis reads all three.

This tree is committed so every worktree an agent works in carries it, but it is the agent
substrate rather than published documentation — the package ships only `dist/`. Anything a
consumer of the package needs to read belongs in `Readme.md` instead.
