import type { Observable } from 'rxjs';
/**
 * Subscribes to an observable and renders the component when the observable emits a new value.
 *
 * @param {Observable} observable
 * @returns The value emitted by the observable.
 */
export declare const useSubscription: <T>(observable: Observable<T>) => T | undefined;
