import { useMemo, useSyncExternalStore } from 'react';
import type { Observable } from 'rxjs';

interface IObservableStore<T> {
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => T | undefined;
}

const createObservableStore = <T>(observable: Observable<T>): IObservableStore<T> => {
  let value: T | undefined;

  // Read the value the observable emits synchronously on subscribe (a ReplaySubject, a BehaviorSubject),
  // so the first render can show it. The probe closes at once: subscribing for real happens in
  // `subscribe`, after commit, so a render React discards leaves no subscription open.
  observable
    .subscribe((next) => {
      value = next;
    })
    .unsubscribe();

  return {
    subscribe: (onStoreChange) => {
      const subscription = observable.subscribe((next) => {
        value = next;
        onStoreChange();
      });
      return () => subscription.unsubscribe();
    },
    getSnapshot: () => value,
  };
};

/**
 * Subscribes to an observable and renders the component when the observable emits a new value.
 *
 * If the observable emits synchronously on subscribe (a `ReplaySubject` with a value, a `BehaviorSubject`, `of(x)`),
 * the first render already returns that value. Otherwise the hook returns `undefined` until the first emission.
 * When the hook gets a different observable, it unsubscribes from the old one and follows the new one.
 *
 * Keep the observable's identity stable between renders (for example with `useMemo` or `useRef`). An observable
 * created inline during render is a new instance on every render, so the hook subscribes again each time.
 *
 * @param {Observable} observable
 * @returns The value emitted by the observable.
 */
export const useSubscription = <T>(observable: Observable<T>): T | undefined => {
  const store = useMemo(() => createObservableStore(observable), [observable]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};
