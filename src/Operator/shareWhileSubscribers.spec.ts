import { defer, NEVER, of, Subject, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { shareWhileSubscribers } from './shareWhileSubscribers';

describe('shareWhileSubscribers', () => {
  it('replays the most recent emission to a subscriber that arrives after it, so a late consumer is not left blank until the next value', () => {
    const source$ = new Subject<number>();
    const shared$ = source$.pipe(shareWhileSubscribers());
    shared$.subscribe();

    source$.next(1);
    source$.next(2);

    const late: number[] = [];
    shared$.subscribe((value) => late.push(value));

    expect(late).toEqual([2]);
  });

  it('tears the source subscription down when the last subscriber leaves, so the next subscriber re-subscribes rather than inheriting a stale connection', () => {
    let subscriptionCount = 0;
    const source$ = defer(() => {
      subscriptionCount += 1;
      return NEVER;
    });
    const shared$ = source$.pipe(shareWhileSubscribers());

    const first = shared$.subscribe();
    first.unsubscribe();
    shared$.subscribe();

    expect(subscriptionCount).toBe(2);
  });

  it('keeps a completed source completed for later subscribers by default, so its side effects do not silently re-run', () => {
    let subscriptionCount = 0;
    const source$ = defer(() => {
      subscriptionCount += 1;
      return of(subscriptionCount);
    });
    const shared$ = source$.pipe(shareWhileSubscribers());

    shared$.subscribe();
    const late: number[] = [];
    shared$.subscribe((value) => late.push(value));

    expect(subscriptionCount).toBe(1);
    expect(late).toEqual([1]);
  });

  it('keeps an errored source errored for later subscribers by default, so the source is not silently retried', () => {
    let subscriptionCount = 0;
    const source$ = defer(() => {
      subscriptionCount += 1;
      return throwError(() => new Error('boom'));
    });
    const shared$ = source$.pipe(shareWhileSubscribers());

    shared$.subscribe({ error: () => undefined });
    let lateError: unknown;
    shared$.subscribe({
      error: (error: unknown) => {
        lateError = error;
      },
    });

    expect(subscriptionCount).toBe(1);
    expect(lateError).toBeInstanceOf(Error);
  });

  it('re-subscribes after completion when resetOnComplete is true, restoring RxJS share behaviour for callers that want it', () => {
    let subscriptionCount = 0;
    const source$ = defer(() => {
      subscriptionCount += 1;
      return of(subscriptionCount);
    });
    const shared$ = source$.pipe(shareWhileSubscribers(1, false, true));

    shared$.subscribe();
    shared$.subscribe();

    expect(subscriptionCount).toBe(2);
  });

  it('re-subscribes after an error when resetOnError is true, restoring RxJS share behaviour for callers that want a retry', () => {
    let subscriptionCount = 0;
    const source$ = defer(() => {
      subscriptionCount += 1;
      return throwError(() => new Error('boom'));
    });
    const shared$ = source$.pipe(shareWhileSubscribers(1, true));

    shared$.subscribe({ error: () => undefined });
    shared$.subscribe({ error: () => undefined });

    expect(subscriptionCount).toBe(2);
  });

  it('replays bufferSize emissions to a late subscriber when a buffer deeper than one is requested', () => {
    const source$ = new Subject<number>();
    const shared$ = source$.pipe(shareWhileSubscribers(2));
    shared$.subscribe();

    source$.next(1);
    source$.next(2);
    source$.next(3);

    const late: number[] = [];
    shared$.subscribe((value) => late.push(value));

    expect(late).toEqual([2, 3]);
  });
});
