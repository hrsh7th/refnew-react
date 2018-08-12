import * as React from "react";
import { create as render } from "react-test-renderer";
import { refnew } from "refnew";
import { create } from "../src";

const State = {
  consumer1: {
    value: 0
  },
  consumer2: {
    value: 0
  }
};
type State = typeof State;

test("Should re-rendering only part of consumers.", () => {
  const { Provider, Consumer, update } = create<State>();
  const select1 = (state: State) => state.consumer1;
  const select2 = (state: State) => state.consumer2;
  const component = render(
    <Provider value={refnew(State)}>
      <Consumer select={select1}>
        {state => (
          <div>
            consumer1-
            {state.value}
          </div>
        )}
      </Consumer>
      <Consumer select={select2}>
        {state => (
          <div>
            consumer2-
            {state.value}
          </div>
        )}
      </Consumer>
    </Provider>
  );
  update(state => state.consumer1.value++);
  expect(component.toJSON()).toMatchSnapshot();
  update(state => state.consumer2.value++);
  expect(component.toJSON()).toMatchSnapshot();
});
