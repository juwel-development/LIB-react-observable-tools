export type TEvent<P = void> = P extends void ? Pick<IEvent<P>, 'type'> : IEvent<P>;

export interface IEvent<P> {
  readonly type: string;
  readonly payload: P;
}
