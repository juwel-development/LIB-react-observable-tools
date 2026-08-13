import { act, renderHook } from '@testing-library/react';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { useSubscription } from './useSubscription';

describe('useSubscription', () => {
  it('returns undefined before the observable has emitted', () => {
    const subject$ = new Subject<number>();
    const { result } = renderHook(() => useSubscription(subject$));

    expect(result.current).toBeUndefined();
  });

  it('returns the most recently emitted value', () => {
    const subject$ = new Subject<number>();
    const { result } = renderHook(() => useSubscription(subject$));

    act(() => subject$.next(1));
    act(() => subject$.next(2));

    expect(result.current).toBe(2);
  });

  it('unsubscribes on unmount, so the observable is not held open by an unmounted component', () => {
    const subject$ = new Subject<number>();
    const { unmount } = renderHook(() => useSubscription(subject$));

    expect(subject$.observed).toBe(true);

    unmount();

    expect(subject$.observed).toBe(false);
  });
});
