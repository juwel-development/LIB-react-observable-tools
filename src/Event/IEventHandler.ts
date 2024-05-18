import type { TEvent } from 'Event/TEvent';

export interface IEventHandler {
  handle(event: TEvent): void;
}
