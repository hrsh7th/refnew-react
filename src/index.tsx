import React from "react";
import shallowequal from "shallowequal";

export type ProviderProps<State> = {
  value?: State;
  children: JSX.Element | JSX.Element[];
};

export type ConsumerProps<State, SelectedState> = {
  select: (s: State) => SelectedState;
  children: (s: SelectedState) => JSX.Element | JSX.Element[];
};

export function create<State extends object>(): {
  Provider: (props: ProviderProps<State>) => JSX.Element;
  Consumer: <SelectedState>(
    props: ConsumerProps<State, SelectedState>
  ) => JSX.Element;
  update: (mutator?: (state: State) => void) => void;
} {
  /**
   * Map for calculates bitmask.
   */
  const selects = new Map<Function, { bit: number; prev?: any }>();

  /**
   * React Context.
   */
  const { Provider, Consumer } = React.createContext<State>(
    {} as State,
    (_: State, next: State) => {
      const bits = Array.from(selects.entries()).reduce(
        (bits, [select, { bit, prev }]) => {
          if (!shallowequal(select(next), prev)) {
            return bits | bit;
          }
          return bits;
        },
        0
      );
      return bits;
    }
  );

  /**
   * RefnewProvider.
   */
  const RefnewProvider = class RefnewProvider extends React.Component<
    ProviderProps<State>,
    { version: number }
  > {
    public state = { version: 0 };

    public componentDidMount() {
      updator = (mutator?: (state: State) => void) => {
        mutator && mutator(this.props.value!);
        this.setState({ version: this.state.version + 1 });
      };
    }

    public componentWillUnmount() {
      updator = (_: any) => {};
    }

    public render() {
      const { children, value } = this.props;
      return (
        <Provider value={Proxy.revocable<State>(value!, {}).proxy}>
          {children}
        </Provider>
      );
    }
  };

  /**
   * RefnewConsumer.
   */
  const RefnewConsumer = class RefnewConsumer<
    SelectedState
  > extends React.Component<
    ConsumerProps<State, SelectedState>,
    { bit: number }
  > {
    public state = { bit: 0 };

    public static getDerivedStateFromProps(props: ConsumerProps<any, any>) {
      if (!selects.has(props.select)) {
        selects.set(props.select, { bit: 1 << selects.size });
      }
      return { bit: selects.get(props.select)!.bit };
    }

    public shouldComponentUpdate() {
      return false;
    }

    public render() {
      return (
        <Consumer unstable_observedBits={this.state.bit}>
          {state => this.select(state)}
        </Consumer>
      );
    }

    public select(state: State) {
      const { children, select } = this.props;
      return children((selects.get(select)!.prev = select(state)));
    }
  };

  let updator: (mutator?: (state: State) => void) => void;
  return {
    Provider: RefnewProvider,
    Consumer: RefnewConsumer,
    update: (mutator?: (state: State) => void) => {
      updator && updator(mutator);
    }
  } as any;
}
