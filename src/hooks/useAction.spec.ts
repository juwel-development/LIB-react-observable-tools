import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { useAction } from './useAction';

// Spies on construction at the RxJS boundary; every instance is a real Subject.
vi.mock('rxjs', async (importOriginal) => {
  const rxjs = await importOriginal<typeof import('rxjs')>();
  return {
    ...rxjs,
    // biome-ignore lint/complexity/useArrowFunction: useAction calls `new Subject()`, and an arrow function can't be constructed.
    Subject: vi.fn(function () {
      return new rxjs.Subject();
    }),
  };
});

describe('useAction', () => {
  it('calls the handler with the value the returned subject was given', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAction<number>(handler));

    act(() => result.current.next(42));

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('returns the same subject across re-renders, so a consumer can hold onto it', () => {
    const { result, rerender } = renderHook(() => useAction(() => {}));
    const firstSubject = result.current;

    rerender();

    expect(result.current).toBe(firstSubject);
  });

  it('keeps the same subject when the handler changes, so a consumer never holds a stale one', () => {
    const { result, rerender } = renderHook(({ handler }) => useAction<number>(handler), {
      initialProps: { handler: vi.fn() },
    });
    const firstSubject = result.current;

    rerender({ handler: vi.fn() });

    expect(result.current).toBe(firstSubject);
  });

  it('calls the handler from the latest committed render, so it never acts on stale props', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ handler }) => useAction<number>(handler), {
      initialProps: { handler: first },
    });

    rerender({ handler: second });
    act(() => result.current.next(1));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });

  it('calls the handler exactly once per emission under StrictMode', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useAction<number>(handler), { wrapper: StrictMode });

    act(() => result.current.next(1));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('stops calling the handler after unmount, so a late emission cannot act on unmounted state', () => {
    const handler = vi.fn();
    const { result, unmount } = renderHook(() => useAction<number>(handler));
    const subject = result.current;

    unmount();
    subject.next(1);

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not complete the subject on unmount, so an effect remount can reuse it', () => {
    const { result, unmount } = renderHook(() => useAction<number>(() => {}));
    const subject = result.current;

    unmount();

    expect(subject.isStopped).toBe(false);
  });

  it('constructs one subject for the lifetime of the component, not one per render', () => {
    vi.mocked(Subject).mockClear();
    const { rerender } = renderHook(() => useAction(() => {}));

    rerender();
    rerender();
    rerender();

    expect(Subject).toHaveBeenCalledTimes(1);
  });

  it('rejects a dependency list, because the handler is always the latest one', () => {
    // @ts-expect-error useAction takes the handler only
    renderHook(() => useAction(() => {}, []));
  });
});
