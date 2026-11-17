import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

/**
 * calls the handler function when the returned subject is triggered. `next()` calls the handler
 * from the most recent committed render, so no dependency list is needed.
 *
 * @param {Function} handler - handler that is called when the subject is triggered
 * @returns {Subject} subject - subject that triggers the handler function, stable for the component's lifetime
 */
export const useAction = <T = void>(handler: (param: T) => void): Subject<T> => {
  const [subject] = useState(() => new Subject<T>());
  const handlerRef = useRef(handler);

  // Updated at commit, not during render, so a render React discards never becomes the active handler.
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const subscription = subject.subscribe((value) => handlerRef.current(value));

    return () => subscription.unsubscribe();
  }, [subject]);

  return subject;
};
