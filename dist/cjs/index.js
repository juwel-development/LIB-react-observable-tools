'use strict';

var react = require('react');
var rxjs = require('rxjs');

/**
 * calls the handler function when the returned subject is triggered
 *
 * @param {Function} handler - handler that is called when the subject is triggered
 * @param {Array<unknown>} dependencies - dependencies of your handler function
 * @returns {Subject} subject - subject that triggers the handler function
 */
const useAction = (handler, dependencies = []) => {
    const subjectRef = react.useRef(new rxjs.Subject());
    react.useEffect(() => {
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
    const [value, setValue] = react.useState();
    react.useEffect(() => {
        const subscription = observable.subscribe(setValue);
        return () => subscription.unsubscribe();
    }, []);
    return value;
};

exports.useAction = useAction;
exports.useSubscription = useSubscription;
//# sourceMappingURL=index.js.map
