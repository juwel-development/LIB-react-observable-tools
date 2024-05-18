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

  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, []);

  return value;
};
