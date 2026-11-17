# Triage labels

Maps the canonical triage **role names** (defined in `.claude/skills/triage/SKILL.md`)
to the **label strings** applied on the issue tracker
([`juwel-development/LIB-react-observable-tools`](https://github.com/juwel-development/LIB-react-observable-tools)).

The skill speaks in canonical roles; the tracker stores labels. This is the single
source of truth for the mapping — currently **1:1 identity**: every canonical role
is applied as a GitHub label of the same name.

## Category roles

| Canonical role | GitHub label | Color     |
| -------------- | ------------ | --------- |
| `bug`          | `bug`        | `#d73a4a` |
| `enhancement`  | `enhancement`| `#a2eeef` |

## State roles

| Canonical role    | GitHub label      | Color     |
| ----------------- | ----------------- | --------- |
| `needs-triage`    | `needs-triage`    | `#d876e3` |
| `needs-info`      | `needs-info`      | `#fbca04` |
| `ready-for-agent` | `ready-for-agent` | `#aaaaaa` |
| `ready-for-human` | `ready-for-human` | `#0e8a16` |
| `wontfix`         | `wontfix`         | `#ffffff` |

Every triaged issue carries exactly one category label and one state label.

## Labels owned by a skill

Not triage roles — listed so nobody re-invents them under another name.

| Label | Owner | Meaning |
| ----- | ----- | ------- |
| `spec` | `/to-spec` | A published spec (PRD). Carries `enhancement` too, never `ready-for-agent`. |
| `wayfinder:map` | `/wayfinder` | The root planning issue whose body is the map. |
| `wayfinder:research` | `/wayfinder` | Decision ticket, AFK — the one type that closes straight to `Done`. |
| `wayfinder:prototype` | `/wayfinder` | Decision ticket, HITL. |
| `wayfinder:grilling` | `/wayfinder` | Decision ticket, HITL. |
| `wayfinder:task` | `/wayfinder` | Decision ticket, HITL or AFK. |

`/orca-implement` **never dispatches a `wayfinder:*` issue**, even one carrying `ready-for-agent` —
those tickets are human-owned.

## Repository-native labels

The repository also carries GitHub's default set (`documentation`, `duplicate`, `good first issue`,
`help wanted`, `invalid`, `question`) plus `released`, none of which are triaged by hand. A
`semantic-release` label may appear automatically — semantic-release opens and labels an issue
itself when a release run fails — and is not triaged either.

## Applying labels

```bash
R=juwel-development/LIB-react-observable-tools
gh issue edit <N> -R $R --add-label ready-for-agent --remove-label needs-triage
```

## Keeping this in sync

If a label string ever diverges from its canonical role (a rename on the tracker,
or a decision to reuse an existing label), record the non-identity mapping in the
tables above rather than renaming the role in the skill — the skill's vocabulary is
stable, the label strings are what move.
