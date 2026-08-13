import * as event from 'Event/index';
import * as hooks from 'hooks/index';
import { describe, expect, it } from 'vitest';

import * as root from './index';

describe('package entry points', () => {
  it('serves the hooks from ./hooks, the half a DI-free consumer wants', () => {
    expect(hooks.useAction).toBeTypeOf('function');
    expect(hooks.useSubscription).toBeTypeOf('function');
  });

  it('serves the event bus from ./Event', () => {
    expect(event.EventHandler).toBeTypeOf('function');
    expect(event.GlobalEvent$).toBeDefined();
    expect(event.GlobalEventStreamToken).toBeTypeOf('symbol');
  });

  it('re-exports both halves from the root, so existing imports keep working unchanged', () => {
    expect(root.useAction).toBe(hooks.useAction);
    expect(root.useSubscription).toBe(hooks.useSubscription);
    expect(root.EventHandler).toBe(event.EventHandler);
    expect(root.GlobalEvent$).toBe(event.GlobalEvent$);
    expect(root.GlobalEventStreamToken).toBe(event.GlobalEventStreamToken);
  });
});
