import { Subject } from 'rxjs';
/**
 * calls the handler function when the returned subject is triggered
 *
 * @param {Function} handler - handler that is called when the subject is triggered
 * @param {Array<unknown>} dependencies - dependencies of your handler function
 * @returns {Subject} subject - subject that triggers the handler function
 */
export declare const useAction: (handler: () => void, dependencies?: unknown[]) => Subject<void>;
