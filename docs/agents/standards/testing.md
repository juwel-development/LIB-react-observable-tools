# Testing standard

How we test this package. Companion to the [coding standard](./coding.md): that one says
*how* code reads, this one says *how we prove it works*.

## The stance

1. **Test-driven, always** — the failing test comes first (red → green → refactor). No production
   code exists that a failing test didn't demand.
2. **Test behaviour, not internals** — assert on what a consumer can observe: emitted values,
   hook return values, whether a handler ran. Never on private state or an implementation detail
   like which `useRef` a hook happens to use internally.
3. **A hook is tested through `renderHook`**, the same entry point a consuming component uses —
   not by calling the hook's body directly outside of React.

## The runner

Vitest (`vitest.config.mts`) with `jsdom` and `globals: true`, and `@testing-library/react`'s
`renderHook`/`act` for the two hooks. There is no setup file and no DOM matcher library: nothing here
renders markup, so Vitest's own `expect` covers every assertion. Discovery is scoped to
`src/**/*.spec.*`, so a git worktree nested in the checkout is never collected.

| Command | What it does |
|---|---|
| `npm run test` | The suite, once. |
| `npm run test:coverage` | The same, with v8 coverage over `src` — what the merge workflow runs. |

There is **no browser-driver level here**. This package ships hooks and a stream primitive, not
UI flows; a real end-to-end test belongs in the application that consumes it.

## Location and naming

- **Colocated.** `useAction.spec.ts` sits beside `useAction.ts` in the same directory.
- **Name tests as behaviour sentences** — `it('unsubscribes on unmount, so a late emission
  cannot update state after the component is gone')`, not `it('cleans up')`. The sentence should
  say why the behaviour matters where that isn't obvious.
- One `describe` per module; prefer flat `it()` inside it.
- **Arrange–Act–Assert**, one behaviour per test.

## What each kind of code needs

- **A hook** (`useAction`, `useSubscription`) — its return value, what happens when the source
  `Subject`/`Observable` emits, and that it unsubscribes on unmount. Drive it through `renderHook`
  and `act`, emit into the underlying `Subject` directly, and assert on the hook's return value or
  on a spy passed in as the handler.
- **`EventHandler` (the class decorator)** — that a decorated class's `handle` is called when a
  matching event is emitted on `GlobalEvent$`, that a `RegExp` type filter matches only intended
  event types, and that a non-matching event does not call `handle`. Reset the shared `tsyringe`
  container between tests (`container.reset()` or an equivalent), because `GlobalEvent$` and every
  registration in `GlobalEventStream.ts` are process-global — a test that doesn't isolate its
  container will see subscriptions and registrations leak from the previous test.
- **An operator** (`shareWhileSubscribers`) — plain RxJS, no React: subscribe to the piped source
  and assert on the values each subscriber receives and on when the source is subscribed and torn
  down.
- **`GlobalEventStream` / `TEvent` / `IEventHandler`** — thin enough that they are usually proven
  by the tests above rather than tested in isolation; test them directly only where they carry
  logic of their own (a type predicate, a factory).

## Test doubles

Barely needed here, and that is the point.

- **Fake at the interface.** Where a consumer-owned boundary interface exists, supply a small
  hand-written implementation rather than a stubbed method.
- **Mocking libraries only at genuine external boundaries** you don't own — `tsyringe`'s container
  reset is the one built-in exception, because the container itself is shared global state, not a
  boundary this package chose. Never mock your own code: if your own code is hard to fake, the seam
  is wrong.
- **No shared mutable fixtures.** Fresh state per test, from a factory function that takes
  overrides, so a test states only what it varies. No `beforeEach` mutation beyond container reset.

## Coverage and done

- **No coverage target.** Coverage is a diagnostic you read — an uncovered line asks "why is this
  untested?" — not a gate you satisfy.
- A change is **done** when: its behaviour was driven by a failing test first, `npm run lint`,
  `npm run typecheck`, and `npm run test` are green (the pre-commit hook runs lint and typecheck; the
  tests run in the merge workflow), and the
  `Readme.md` usage example still matches the API if the change touched it.
- **A bug fix starts with a failing test that reproduces it** — regression-first, same red → green.
