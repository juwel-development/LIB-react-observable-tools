import { useRef, useEffect, useState } from 'react';
import { Subject } from 'rxjs';

/**
 * calls the handler function when the returned subject is triggered
 *
 * @param {Function} handler - handler that is called when the subject is triggered
 * @param {Array<unknown>} dependencies - dependencies of your handler function
 * @returns {Subject} subject - subject that triggers the handler function
 */
const useAction = (handler, dependencies = []) => {
    const subjectRef = useRef(new Subject());
    useEffect(() => {
        const subscription = subjectRef.current.subscribe(handler);
        return () => subscription.unsubscribe();
    }, dependencies);
    return subjectRef.current;
};

/**
 * Subscribes to an observable and renders the component when the observable emits a new value.
 *
 * @param {Observable} observable
 * @returns The value emitted by the observable.
 */
const useSubscription = (observable) => {
    const [value, setValue] = useState();
    useEffect(() => {
        const subscription = observable.subscribe(setValue);
        return () => subscription.unsubscribe();
    }, []);
    return value;
};

export { useAction, useSubscription };
//# sourceMappingURL=index.js.map
