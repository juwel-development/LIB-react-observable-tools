# Architecture standard

The structure of the `@juwel-development/react-observable-tools` codebase: what the package is,
how it is laid out, which way dependencies point, and where each concern lives.

## What this package is

**One published npm package, and nothing else.** No monorepo, no workspaces, no app. It ships a
small set of React hooks, an RxJS-backed global event system built on a `tsyringe` DI container,
and an RxJS operator, with `react`, `rxjs`, `tsyringe`, and `reflect-metadata` as **peers** so a
consumer dedupes them. `tsyringe` and `reflect-metadata` are **optional** peers: only the event
system needs them, so a consumer that imports only `/hooks` or `/operator` never installs them.

That shapes every rule below: there is no application here to hold the composition, so the package
must be composable from outside without knowing anything about who consumes it.

## Two rules

1. **The entry points are the API.** `src/index.ts` re-exports everything, and each category's
   `index.ts` is a subpath entry point of its own — `/hooks`, `/event`, `/operator` — so a consumer
   can take one category without loading the others' peers. These four are the only barrels; what
   they re-export is the package's API, and everything else is internal. Adding an entry point
   means adding it in three places: the category's `index.ts`, the `input` map in
   `rollup.config.mjs`, and `package.json#exports`.
2. **Dependencies point one way:** `hooks/`, `Event/`, and `Operator/` are independent categories —
   none imports from another. Inside `Event/`, `TEvent` has no
   dependencies, `IEventHandler` and `GlobalEventStream` depend only on `TEvent`, and
   `EventHandlerAnnotation` is the one module that depends on the others (`GlobalEventStream` and
   `TEvent`) to wire a decorated class into the stream.

**The import test:** could this file be deleted without touching an entry point, and does it import
nothing from a sibling category? If either answer is no, look again.

## Layout

```
src/
  index.ts                        the root entry point — re-exports every category
  hooks/
    index.ts                      the `/hooks` entry point
    useAction.ts                  Subject-backed handler for one-off user interactions
    useSubscription.ts            renders a component on an Observable's emissions
  Event/
    index.ts                      the `/event` entry point; imports `reflect-metadata` first
    TEvent.ts                     the event shape (TEvent, IEvent)
    IEventHandler.ts              the handler contract a class implements
    GlobalEventStream.ts          the shared Subject<TEvent> registered in the tsyringe container
    EventHandlerAnnotation.ts     the @EventHandler class decorator that subscribes a handler
  Operator/
    index.ts                      the `/operator` entry point
    shareWhileSubscribers.ts      multicast-and-replay that drops the source at zero subscribers
```

- **A category is a role, not a kind.** `hooks/` holds React hooks; `Event/` holds the global
  event-stream primitives; `Operator/` holds pipeable RxJS operators. Add a category when a second
  primitive genuinely shares a new role —
  never a `components/`, `utils/`, or `common/` bucket.
- **Every category owns a directory**, because every category is an entry point with its own
  `index.ts` — even `Operator/`, whose one operator is a single file.

## Imports: type-only may be non-relative, values are relative

`tsconfig.json` maps `"paths": { "*": ["./src/*"] }` (the replacement for `baseUrl`, which
TypeScript 6 removed), so `tsc` and Vitest (`resolve.tsconfigPaths`) resolve a module by its path
under `src`:

```ts
import type { TEvent } from 'Event/TEvent';           // ✅ type-only, erased before bundling
import { GlobalEvent$ } from './GlobalEventStream';   // ✅ value import, same directory
import { GlobalEvent$ } from 'Event/GlobalEventStream'; // ❌ value import, non-relative
```

**Rollup does not read those paths.** `rollup-plugin-esbuild` transpiles each file on its own, so a
non-relative **value** import is left in `dist` as an unresolved bare import — Rollup only warns
(`Unresolved dependencies`), and typecheck and the tests still pass, so nothing but a consumer's
bundler catches it. A non-relative specifier is therefore safe only behind `import type`. A value
import is relative, and the dependency rules above keep it inside its own directory, or from an
entry point down into its category (`src/index.ts` → `./Event`).

## Dependency injection

`tsyringe` is a **peer**, not a bundled implementation detail: this package registers into the
*consumer's* container (`container.register(...)` in `GlobalEventStream.ts` runs against the
global `tsyringe` container, which is a singleton across the whole process). A consumer that also
uses `tsyringe` shares that registration; a consumer that doesn't still gets it transitively
through the peer dependency. `reflect-metadata` is imported once, at the top of
`src/Event/index.ts` — the entry point both `/event` and the root re-export go through — because
decorator metadata must be installed before any decorated class is evaluated, and importing it
anywhere else risks a decorator running before the polyfill is in place. The hooks and
the operator never touch it.

## The build

| Command | What it produces |
|---|---|
| `npm run build` | `dist/cjs/` and `dist/es/` — Rollup, both formats, one file per entry point (`index`, `hooks`, `event`, `operator`) plus shared chunks — then the declarations |
| `npm run typecheck` | No emit; `tsc --noEmit` against `tsconfig.json` |

`rollup.config.mjs` marks `react`, `rxjs`, `tsyringe`, and `reflect-metadata` `external` — none of
them are ever bundled, matching the peer dependency list. Transpilation runs through
`rollup-plugin-esbuild`, because TypeScript 7's native compiler has no programmatic API for a
TypeScript Rollup plugin to call; the declarations come from `tsc` itself
(`tsconfig.build.json`, `--emitDeclarationOnly`) into `dist/es/src/`, which is where
`package.json#types` and each `exports` entry's `types` point. `package.json#files` ships `dist`
only — there is no `src`
export for consumers to read here, unlike a components package that ships its own source.

## Release

Commits are [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint on
`commit-msg`; semantic-release derives the version and changelog from them. The `pre-commit` hook
runs `npm run lint` and `npm run typecheck`; the tests run in the merge workflow, alongside lint,
typecheck, build, and commitlint over the branch's commits. **A `feat:` or `fix:` commit publishes a
version**, so scope commits accordingly.
