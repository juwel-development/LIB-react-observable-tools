import { act, renderHook } from '@testing-library/react';
import type { Observable } from 'rxjs';
import { BehaviorSubject, map, ReplaySubject, Subject, timer } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { useSubscription } from './useSubscription';

const renderRecordingHook = <T>(observable$: Observable<T>) => {
  const renders: (T | undefined)[] = [];
  const rendered = renderHook(() => {
    const value = useSubscription(observable$);
    renders.push(value);
    return value;
  });

  return { ...rendered, renders };
};

const renderWithObservable = (observable$: Observable<string>) =>
  renderHook(({ observable }) => useSubscription(observable), {
    initialProps: { observable: observable$ },
  });

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

  it('returns the value a ReplaySubject replays on the first render, so no empty frame renders before it', () => {
    const subject$ = new ReplaySubject<number>(1);
    subject$.next(1);

    const { renders } = renderRecordingHook(subject$);

    expect(renders[0]).toBe(1);
    expect(renders).not.toContain(undefined);
  });

  it("returns a BehaviorSubject's value on the first render, so no empty frame renders before it", () => {
    const subject$ = new BehaviorSubject(1);

    const { renders } = renderRecordingHook(subject$);

    expect(renders[0]).toBe(1);
    expect(renders).not.toContain(undefined);
  });

  it("rerenders with a BehaviorSubject's next value", () => {
    const subject$ = new BehaviorSubject(1);
    const { result } = renderHook(() => useSubscription(subject$));

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

  it('returns the value of a changed observable, so a component never shows a previous stream', () => {
    const second$ = new BehaviorSubject('second');
    const { result, rerender } = renderWithObservable(new BehaviorSubject('first'));

    rerender({ observable: second$ });

    expect(result.current).toBe('second');
  });

  it('closes the subscription to the old observable when the observable changes, so it is not held open', () => {
    const first$ = new BehaviorSubject('first');
    const { rerender } = renderWithObservable(first$);

    rerender({ observable: new BehaviorSubject('second') });

    expect(first$.observed).toBe(false);
  });

  it('ignores values the old observable emits after the observable changed', () => {
    const first$ = new BehaviorSubject('first');
    const { result, rerender } = renderWithObservable(first$);
    rerender({ observable: new BehaviorSubject('second') });

    act(() => first$.next('stale'));

    expect(result.current).toBe('second');
  });

  it('unsubscribes from a replaying observable on unmount, although the first render already read its value', () => {
    const subject$ = new ReplaySubject<number>(1);
    subject$.next(1);
    const { unmount } = renderHook(() => useSubscription(subject$));

    expect(subject$.observed).toBe(true);

    unmount();

    expect(subject$.observed).toBe(false);
  });
});
