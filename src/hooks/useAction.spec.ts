import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAction } from './useAction';

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

  it('stops calling the handler after unmount, so a late emission cannot act on unmounted state', () => {
    const handler = vi.fn();
    const { result, unmount } = renderHook(() => useAction<number>(handler));
    const subject = result.current;

    unmount();
    subject.next(1);

    expect(handler).not.toHaveBeenCalled();
  });

  it('resubscribes with the latest handler when its dependencies change', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ handler }) => useAction<number>(handler, [handler]), {
      initialProps: { handler: first },
    });

    rerender({ handler: second });
    act(() => result.current.next(1));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });
});
