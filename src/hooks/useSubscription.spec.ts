import { act, renderHook } from '@testing-library/react';
import { BehaviorSubject, ReplaySubject, Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { describe, expect, it, vi } from 'vitest';

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

  it('returns the value a ReplaySubject replays on the first render', () => {
    const subject$ = new ReplaySubject<number>(1);
    subject$.next(1);
    const renders: (number | undefined)[] = [];

    renderHook(() => {
      const value = useSubscription(subject$);
      renders.push(value);
      return value;
    });

    expect(renders[0]).toBe(1);
    expect(renders).not.toContain(undefined);
  });

  it("returns a BehaviorSubject's value on the first render and rerenders on the next value", () => {
    const subject$ = new BehaviorSubject(1);
    const renders: number[] = [];

    const { result } = renderHook(() => {
      const value = useSubscription(subject$);
      renders.push(value as number);
      return value;
    });

    expect(renders[0]).toBe(1);

    act(() => subject$.next(2));

    expect(result.current).toBe(2);
  });

  it('returns undefined until a cold observable emits later, then its value', () => {
    vi.useFakeTimers();
    try {
      const delayed$ = timer(100).pipe(map(() => 'done'));
      const { result } = renderHook(() => useSubscription(delayed$));

      expect(result.current).toBeUndefined();

      act(() => vi.advanceTimersByTime(100));

      expect(result.current).toBe('done');
    } finally {
      vi.useRealTimers();
    }
  });

  it('follows a changed observable and closes the subscription to the old one', () => {
    const first$ = new BehaviorSubject('first');
    const second$ = new BehaviorSubject('second');
    const { result, rerender } = renderHook(({ observable }) => useSubscription(observable), {
      initialProps: { observable: first$ },
    });

    expect(result.current).toBe('first');

    rerender({ observable: second$ });

    expect(result.current).toBe('second');
    expect(first$.observed).toBe(false);
    expect(second$.observed).toBe(true);

    act(() => first$.next('stale'));

    expect(result.current).toBe('second');
  });

  it('closes the subscription to a replaying observable on unmount', () => {
    const subject$ = new ReplaySubject<number>(1);
    subject$.next(1);
    const { unmount } = renderHook(() => useSubscription(subject$));

    expect(subject$.observed).toBe(true);

    unmount();

    expect(subject$.observed).toBe(false);
  });
});
