# @juwel-development/react-observable-tools

This package provides tools to integrate [rxjs](https://rxjs.dev) with [react](https://reactjs.org/).

## Installation

```bash
npm install @juwel-development/react-observable-tools
```

## Requirements

This package requires `react` and `rxjs` as peer dependencies. As we also rely on dependency injection, you need to have `tsyringe`
installed.

## Use cases

### Dispatch events to a global event stream

We use `tsyringe` and register a global event stream. You can dispatch events to this stream from anywhere in your application.

```typescript
import { GlobalEvent$, GlobalEventStreamToken, TEvent } from '@juwel-development/react-observable-tools';

class ApplicationStarted implements TEvent {
  public readonly type = 'APPLICATION_STARTED';
}

class EventDispatcher {
  constructor(
    @inject(GlobalEventStreamToken) private globalEvent$: GlobalEvent$
  ) {
  }

  public applicationStarted() {
    const event = new ApplicationStarted();
    this.globalEvent$.next(ApplicationStarted);
  }
}
```

### Implement event handler that react to global events

You can decorate your event handler with the `@EventHandler` decorator. This way you can react to events that are dispatched to the global
event stream.

```typescript
import { EventHandler, IEventHandler } from '@juwel-development/react-observable-tools';

@EventHandler('APPLICATION_STARTED')
class ApplicationStartedEventHandler implements IEventHandler<ApplicationStarted> {
  public handle(event: ApplicationStarted) {
    console.log('Application started');
  }
}
```

`handle` is called whenever an event of type `APPLICATION_STARTED` is dispatched to the global event stream. Make sure to import your event
handler somewhere in your application, otherwise it is not discovered and will not be called.

### Trigger side effects when the user interacts with your application

You can use the `useAction` hook to trigger side effects when the user interacts. Let's assume the user is clicking on a button, and you
want to emit this event to some external classes.

```tsx
import { useAction } from '@juwel-development/react-observable-tools';

const CounterButton: FunctionComponent = () => {
  const dispatch = useDispatcher();
  const onClick$ = useAction(() => {
    dispatch({ type: 'COUNTER_INCREASE_COMMAND' });
  }, []);

  return <button onClick={() => onClick$.next()}>Increase</button>;
};
```

### Render a React component only when needed

The advantage of using an `Observable` is, that you can bring the state to the components that are interested in it. This way you can emit
new values everywhere in you application, but you only rerender the components that are interested in the these new values. You can avoid
having state in parent components, instead you can use parse reference to your `Observable` and subscribe when needed.

```tsx
import { useSubscription } from '@juwel-development/react-observable-tools';

interface IProps {
  counter$: Observable<number>;
}

const CounterValue: FunctionComponent<IProps> = ({ counter$ }) => {
  const currentNumber = useSubscription(counter$)

  return <div>{currentNumber}</div>;
};
```