# @juwel-development/react-observable-tools

This package provides tools to integrate [rxjs](https://rxjs.dev) with [react](https://reactjs.org/).

## Installation

```bash
npm install @juwel-development/react-observable-tools
```

## Requirements
This package requires `react` and `rxjs` as peer dependencies. As we also rely on dependency injection, you need to have `tsyringe` installed.

## Use cases

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

### Render a react component only when needed

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