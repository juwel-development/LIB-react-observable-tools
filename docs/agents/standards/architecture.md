# Architecture standard

The structure of the `@juwel-development/react-observable-tools` codebase: what the package is,
how it is laid out, which way dependencies point, and where each concern lives.

## What this package is

**One published npm package, and nothing else.** No monorepo, no workspaces, no app. It ships a
small set of React hooks and an RxJS-backed global event system, built on a `tsyringe` DI
container, with `react`, `rxjs`, `tsyringe`, and `reflect-metadata` as **peers** so a consumer
dedupes them.

That shapes every rule below: there is no application here to hold the composition, so the package
must be composable from outside without knowing anything about who consumes it.

## Two rules

1. **One public entry point.** `src/index.ts` is the only barrel in the repository. What it
   re-exports is the package's API; everything else is internal, whatever the file tree suggests.
2. **Dependencies point one way:** `hooks/` and `Event/` are independent categories — a hook never
   imports from `Event/`, and nothing in `Event/` imports a hook. Inside `Event/`, `TEvent` has no
   dependencies, `IEventHandler` and `GlobalEventStream` depend only on `TEvent`, and
   `EventHandlerAnnotation` is the one module that depends on the others (`GlobalEventStream` and
   `TEvent`) to wire a decorated class into the stream.

**The import test:** could this file be deleted without touching `src/index.ts`, and does it import
nothing from a sibling category? If either answer is no, look again.

## Layout

```
src/
  index.ts                        the one public entry point
  hooks/
    useAction.ts                  Subject-backed handler for one-off user interactions
    useSubscription.ts            renders a component on an Observable's emissions
  Event/
    TEvent.ts                     the event shape (TEvent, IEvent)
    IEventHandler.ts              the handler contract a class implements
    GlobalEventStream.ts          the shared Subject<TEvent> registered in the tsyringe container
    EventHandlerAnnotation.ts     the @EventHandler class decorator that subscribes a handler
```

- **A category is a role, not a kind.** `hooks/` holds React hooks; `Event/` holds the global
  event-stream primitives. Add a category when a second primitive genuinely shares a new role —
  never a `components/`, `utils/`, or `common/` bucket.
- **A multi-file concern owns a directory** (`Event/`); a single-file concern is a bare file under
  `src/` (today: none — both existing concerns are already multi-file).

## Imports are non-relative from `src`

`tsconfig.json` sets `"baseUrl": "./src"`, so a module is addressed by its path under `src`:

```ts
import type { TEvent } from 'Event/TEvent';   // ✅
import type { TEvent } from '../Event/TEvent';   // ❌
```

`rollup.config.mjs`, `vitest.config.ts` (once added), and `tsc` all read the same `tsconfig.json`,
so a new path stays resolvable everywhere by construction — there is no second place to register
it. A relative import (`./TEvent`) is fine only between files that already sit in the same
directory — that is one module talking to itself.

## Dependency injection

`tsyringe` is a **peer**, not a bundled implementation detail: this package registers into the
*consumer's* container (`container.register(...)` in `GlobalEventStream.ts` runs against the
global `tsyringe` container, which is a singleton across the whole process). A consumer that also
uses `tsyringe` shares that registration; a consumer that doesn't still gets it transitively
through the peer dependency. `reflect-metadata` is imported once, at the top of `src/index.ts`,
because decorator metadata must be installed before any decorated class is evaluated — importing
it anywhere else risks a decorator running before the polyfill is in place.

## The build

| Command | What it produces |
|---|---|
| `npm run build` | `dist/cjs/index.js` and `dist/es/index.js` — Rollup, both formats, from `src/index.ts` |
| `npm run typecheck` | No emit; `tsc --noEmit` against `tsconfig.json` |

`rollup.config.mjs` marks `react`, `rxjs`, `tsyringe`, and `reflect-metadata` `external` — none of
them are ever bundled, matching the peer dependency list. `rollup-plugin-typescript2` emits
declarations alongside the ES build, which is where `package.json#types`
(`dist/es/src/index.d.ts`) points. `package.json#files` ships `dist` only — there is no `src`
export for consumers to read here, unlike a components package that ships its own source.

## Release

Commits are [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint on
`commit-msg`; semantic-release derives the version and changelog from them. The `pre-commit` hook
runs `npm run lint`, `npm run typecheck`, and `npm run test` — a commit that would fail CI does not
get made. **A `feat:` or `fix:` commit publishes a version**, so scope commits accordingly.
