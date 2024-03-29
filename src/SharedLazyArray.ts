import Huds0nError from "@huds0n/error";
import { SharedState } from "@huds0n/shared-state";

import type { Types } from "./types";

type State<E> = {
  data: E[];
  pageEnd: boolean;
  isError: Huds0nError | null;
  isLoading: boolean;
};

export class SharedLazyArray<E> {
  private _lazyGet: Types.LazyGet<E>;
  private _SharedState: SharedState<State<E>>;

  constructor(lazyGet: Types.LazyGet<E>) {
    this._SharedState = new SharedState<State<E>>({
      data: [],
      pageEnd: false,
      isError: null,
      isLoading: false,
    });

    this._lazyGet = lazyGet;

    this.lazyGet = this.lazyGet.bind(this);
    this.refresh = this.refresh.bind(this);
    this.reset = this.reset.bind(this);
    this.use = this.use.bind(this);
    this.useArray = this.useArray.bind(this);
  }

  get data() {
    return this._SharedState.state.data;
  }

  get isError() {
    return this._SharedState.state.isError;
  }

  get isLoading() {
    return this._SharedState.state.isLoading;
  }

  get pageEnd() {
    return this._SharedState.state.pageEnd;
  }

  get SharedState() {
    return this._SharedState;
  }

  async lazyGet(options?: { reset: boolean }) {
    if (options?.reset) this._SharedState.reset();

    const { data, pageEnd } = this._SharedState.state;

    if (!pageEnd) {
      this._SharedState.setState({ isLoading: true });

      try {
        const { data: newData, pageEnd: newPageEnd } = await Promise.resolve(
          this._lazyGet(data.length, data)
        );

        this._SharedState.setState({
          data: [...data, ...newData],
          isLoading: false,
          pageEnd: newPageEnd || !newData.length,
        });

        return { data: newData, pageEnd: newPageEnd };
      } catch (error) {
        this._SharedState.setState({
          isError: Huds0nError.transform(error, {
            name: "State Error",
            code: "LAZY_GET_ERROR",
            message: "Error lazy getting data",
            severity: "HIGH",
            info: { ...this._SharedState.state },
          }),
          isLoading: false,
        });
      }
    }

    return null;
  }

  refresh() {
    this._SharedState.refresh();
  }

  reset() {
    this._SharedState.reset();
  }

  use() {
    const [state] = this._SharedState.useState([
      "data",
      "isError",
      "isLoading",
      "pageEnd",
    ]);
    return state;
  }

  useArray() {
    return this.use().data;
  }
}
