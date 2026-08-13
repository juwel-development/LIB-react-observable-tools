import type { Observable } from 'rxjs';
import { ReplaySubject, share } from 'rxjs';

/**
 * Multicasts a source and replays its latest value(s) to late subscribers, while tearing the
 * source subscription down once the last subscriber leaves so the next subscriber re-subscribes.
 *
 * Like `shareReplay`, a subscriber that arrives after an emission still receives the most recent
 * value(s); unlike `shareReplay`, the source is dropped when the subscriber count returns to zero
 * rather than held open forever. By default an errored or completed source stays that way for later
 * subscribers — it is not silently re-run — which avoids duplicating a side effect. Pass
 * `resetOnError` or `resetOnComplete` to restore RxJS's own reset-and-retry behaviour for those
 * cases.
 *
 * @example
 * // Replay the last three emissions to a late subscriber:
 * source$.pipe(shareWhileSubscribers(3));
 *
 * @param bufferSize How many of the latest emissions to replay to a new subscriber. Default `1`.
 * @param resetOnError When `true`, an errored source is re-subscribed for a later subscriber.
 *   Default `false`, so an errored source keeps delivering that error.
 * @param resetOnComplete When `true`, a completed source is re-subscribed for a later subscriber.
 *   Default `false`, so a completed source stays completed.
 * @returns An operator that shares and replays the source under the rules above.
 */
export const shareWhileSubscribers = <T>(
  bufferSize: number = 1,
  resetOnError: boolean = false,
  resetOnComplete: boolean = false,
): ((source: Observable<T>) => Observable<T>) =>
  share<T>({
    connector: () => new ReplaySubject<T>(bufferSize),
    resetOnError,
    resetOnComplete,
    resetOnRefCountZero: true,
  });
