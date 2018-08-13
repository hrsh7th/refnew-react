# refnew-react

refnew bindings for react.

# install

`npm install refnew refnew-react`

# Usage

### Basic

```ts
// index.ts
import { create } from "refnew-react";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

export type State = {
  todos: {
    title: string;
    status: "in-progress" | "done";
  }[];
  user: {
    name: string;
    icon: string;
  };
};

const { Provider, Consumer, update } = create<State>();
export { Provider, Consumer, update };

ReactDOM.render(
  <Provider value={createInitialValue()}>
    <App />
  </Provider>,
  document.querySelector("#app")!
);
```

```ts
// App.ts
import { Consumer, State, update } from './';

const select = (state: State) => ({
  todos: state.todos
});
export const App = () => (
  <Consumer select={select}>
    {({ todos }) => (
      {todos.map(todo => <div onClick={onClick.bind(null, todo)}>{todo.title} - {todo.status}</div>)}
    )}
  </Consumer>
);

const onClick = (todo: { title: string; status: string; }) => {
  todo.status = 'done';
  update();
};
```

# see

- [refnew](https://github.com/hrsh7th/refnew)

# note

- inspired by `aweary/react-copy-write`.
- don't use production.
