# Coding standard

How we write TypeScript. Companion to the [architecture standard](./architecture.md): that one
says *where* code lives, this one says *how* it reads.

## The stance

1. **Immutable by default** — produce new data, don't mutate.
2. **Behaviour lives in a named thing** — a hook, a module-scope function, or a class where there
   is genuinely state or a DI registration to own. No logic inlined into a JSX attribute beyond a
   one-liner.
3. **Composed, not inherited** — small single-responsibility units wired together. The only
   `extends` allowed is a custom error on `Error`.

This package is hooks and a small RxJS/tsyringe event system: today its behaviour is two hooks, a
handler contract, a shared `Subject`, and one class decorator. **Classes are for state with
invariants to protect, or a class a consumer decorates and registers with `tsyringe`** — not a
default wrapper around a function.

## Linting and formatting

ESLint (`.eslintrc`) plus Prettier through `eslint-plugin-prettier`.

```bash
npm run lint      # eslint . --ext .ts,.tsx — the gate; the pre-commit hook runs it
```

`no-console` is an **error**: a library never writes to a consumer's console. Type-aware rules
(`no-unsafe-*`, `no-floating-promises`, `no-misused-promises`, `restrict-template-expressions`,
`unbound-method`, …) are scoped to `src/**/*.{ts,tsx}` via the type-checked override.

## Interfaces and types

- **`interface` = behaviour** (a role like `IEventHandler`).
- **Interfaces are prefixed `I`** — `IEvent`, `IEventHandler`, not `Event`. The name still reads as
  a capability or a shape a caller can satisfy.
- **`type` names a shape derived from a generic or a union, prefixed `T`** — `TEvent<P>`, not
  `Event<P>`. Reach for `interface` when there is nothing generic or conditional about the shape.
- **Consumers own boundary interfaces** — a consumer declares the interface for what it needs and
  uses only that; this package does not grow interfaces speculatively for hypothetical consumers.
- **One export per file**, named after it. **No barrels** except `src/index.ts`.
- **Interfaces and type aliases live in their own files**, named after them (`TEvent.ts`,
  `IEventHandler.ts`), except where two are small and inseparable (`TEvent.ts` also holds `IEvent`,
  which `TEvent` is defined in terms of).
- **Typing is explicit and enforced** — no implicit `any`; public APIs are annotated. An index read
  on an array or record is `T | undefined` and must be narrowed.
- **Avoid `any` and `unknown`** — use a precise type. `unknown` only at a genuine untrusted
  boundary, narrowed immediately. `@typescript-eslint/no-explicit-any` is an error.
- **A type-only import says `import type`** — `@typescript-eslint/consistent-type-imports` is an
  error, and it matters here specifically: `reflect-metadata`'s side effects must run before a
  decorated class is evaluated, so a value import that should have been `import type` can
  reorder emitted output in a way that breaks decorator metadata.

## Naming

Names replace comments.

- **No abbreviations** — full words. Only `id`, `url`, `min`, `max` allowed.
- **No noise words** — no `data`, `info`, `manager`, `helper`, `util`.
- Functions are verbs, classes/fields are nouns, booleans read as assertions (`isActive`).
- **Observable-valued exports, props, and fields end in `$`** — `GlobalEvent$`, `onClick$`. See
  [Asynchrony](#asynchrony).

| Kind | Case | Example |
|---|---|---|
| Hook | `camelCase`, prefixed `use` | `useSubscription` |
| Interface | `I` + `PascalCase` | `IEventHandler` |
| Type alias | `T` + `PascalCase` | `TEvent` |
| Enum (once one exists) | `E` + `PascalCase` | `EDirection` |
| Class decorator factory | `PascalCase`, named for what it does | `EventHandler` |
| Function, field, local | `camelCase` | `describeWork` |
| Observable / Subject | `camelCase` or `PascalCase` per its binding, suffixed `$` | `GlobalEvent$`, `onClick$` |
| DI token | `PascalCase`, suffixed `Token` | `GlobalEventStreamToken` |
| Global constant | `SCREAMING_SNAKE_CASE` | — |
| Local constant | `camelCase` | `handlerRef` |
| File | matches its hook, class, interface, or type alias | `useAction.ts`, `IEventHandler.ts` |
| Test | the module plus `.spec` | `useAction.spec.ts` |

## Error handling

- **Throw for the impossible** — invariants, impossible states, programmer errors. Loud and early.
- **Return expected failure as data** — a normal outcome is not an exception.
- Errors are typed classes on `Error`.
- **Validate untrusted input at the boundary**; trust types inside.
- **Never swallow** — catch only to handle or rethrow with context.
- **This library never writes to the console** (`no-console`); a hook or handler either does its
  job or throws.

## Asynchrony

**RxJS is the whole async story** — `Subject` and `Observable`, not `.then()` chains or bare
callbacks. `rxjs` is a peer dependency for exactly this reason, and the two hooks in this package
exist to bridge that world into React's render cycle, not to replace it with one.

- **A one-off interaction is a `Subject`, suffixed `$`** — see `useAction`, which hands back a
  `Subject<T>` a consumer calls `.next()` on. This is a deliberate divergence from a plain callback
  prop: a consumer composes the `Subject` with the rest of its streams instead of bridging a
  callback into them.
- **A hook that surfaces a stream's value never re-emits into it** — `useSubscription` only reads;
  it does not `.next()` on the `Observable` it was handed.
- Ownership of a `Subject`'s lifetime is the caller's: `useAction` creates its own once (lazy
  `useState`) and unsubscribes its handler in the `useEffect` cleanup without completing it, and
  `GlobalEvent$` is process-lifetime by design — it is registered once in the `tsyringe` container
  and never completed.
- One-shot I/O may `await` internally but is exposed as an `Observable` or `Subject` across a
  public boundary.

## Absence

- **`undefined`, never `null`.**
- Use `undefined` only when a value is **genuinely optional**. If a value is needed, it's
  **required — never declared optional**.

## Comments

A comment is **load-bearing** or it goes. The test is to delete it: if a fact the code and the
docs cannot recover goes with it, keep it. Otherwise it was a second copy of something already
written down, and a second copy drifts.

- **Load-bearing means evidence** — the reason `reflect-metadata` is imported first in
  `src/index.ts` and nowhere else, the `@ts-expect-error` note in `EventHandlerAnnotation.ts`
  explaining exactly what is unsound and why. Facts nobody reading the code could derive.
- **Cite the standard, never restate it.** A rule that lives in `docs/agents/standards/` is named
  by file and section in one line, not re-explained in prose that will diverge from it.
- **Future work is a marker** — `// TODO(#43): …` on its own line, so it dies with the issue
  rather than rotting into prose.
- **Reach for the name first.** Where a comment would explain a member, rename the member.
- **TSDoc on the public surface is not a comment in this sense** — the `/** … */` blocks on
  `useAction` and `useSubscription` are API documentation, reach the consumer's editor, and stay.

Budget, checked in review: a file header of at most 6 lines, any other block at most 4. Over
budget means the material must be reduced.

## Tests

- **Test-driven, always.** Write the failing test first, make it pass, then refactor
  (red → green → refactor). No production code without a failing test that demanded it.
- The full standard is [testing.md](./testing.md).

## Files

- **Group by feature, not by kind** — `Event/` owns every module the event system needs; no
  `interfaces/`, `types/`, or `services/` bucket folders.
- **Tests are colocated** with the module they cover, not in a parallel tree.
- **Imports are non-relative from `src`** — see the [architecture standard](./architecture.md).

## React

- **Hooks only, declared as `const`.** This package ships no components; every public surface that
  touches React is a hook.
- **A hook does the minimum React requires** — `useAction` wraps exactly one `useEffect`/cleanup
  pair around one RxJS primitive (plus only the layout effect that keeps its handler ref on the
  latest commit); `useSubscription` bridges one `Observable` through `useSyncExternalStore`, which
  reads a replayed value in the first render and does not tear under concurrent rendering (#12).
  New behaviour is a new hook, not more responsibility piled onto an existing one.
