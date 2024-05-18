import { useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

/**
 * calls the handler function when the returned subject is triggered
 *
 * @param {Function} handler - handler that is called when the subject is triggered
 * @param {Array<unknown>} dependencies - dependencies of your handler function
 * @returns {Subject} subject - subject that triggers the handler function
 */
export const useAction = <T = void>(handler: (param: T) => void, dependencies: unknown[] = []): Subject<T> => {
  const subjectRef = useRef(new Subject<T>());

  useEffect(() => {
    const subscription = subjectRef.current.subscribe(handler);

    return () => subscription.unsubscribe();
  }, dependencies);

  return subjectRef.current;
};
