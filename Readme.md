# @juwel-development/react-observable-tools

This package is providing tools to integrate [rxjs](https://rxjs-dev.firebaseapp.com/) with [react](https://reactjs.org/).

## Installation

```bash
npm install @juwel-development/react-observable-tools
```

## Use cases

### Render a react component only when needed

The advantage of using an `Observable` is, that you can bring the state to the components that are interested in it. This way you can emmit
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
}
```