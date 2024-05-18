import type { TEvent } from 'Event/TEvent';
import { Subject } from 'rxjs';
import { container } from 'tsyringe';

export const GlobalEventStreamToken = Symbol('GlobalEvent$');
export const GlobalEvent$ = new Subject<TEvent>();
container.register(GlobalEventStreamToken, { useValue: GlobalEvent$ });
