import type { TEvent } from 'Event/TEvent';

export interface IEventHandler<T extends TEvent> {
  handle(event: T): void | Promise<void>;
}
