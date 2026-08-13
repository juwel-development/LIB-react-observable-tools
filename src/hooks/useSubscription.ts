import { useEffect, useState } from 'react';
import type { Observable } from 'rxjs';

/**
 * Subscribes to an observable and renders the component when the observable emits a new value.
 *
 * @param {Observable} observable
 * @returns The value emitted by the observable.
 */
export const useSubscription = <T>(observable: Observable<T>) => {
  const [value, setValue] = useState<T | undefined>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: subscribes once to the observable instance passed in on mount; re-subscribing on identity change is a behavior change outside this lint migration's scope.
  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, []);

  return value;
};
