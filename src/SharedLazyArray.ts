import Error from '@huds0n/error';
import { SharedState } from '@huds0n/shared-state';

export namespace SharedLazyArray {
  export type GetResult<E> = { data: E[]; pageEnd?: boolean };
  export type GetFunction<E> = (
    offset: number,
    data: E[],
  ) => GetResult<E> | Promise<GetResult<E>>;

  export type State<E> = {
    data: E[];
    pageEnd: boolean;
    isError: Error | null;
    isLoading: boolean;
  };
}

export class SharedLazyArray<E> {
  private _lazyGetFunction: SharedLazyArray.GetFunction<E>;
  private _SharedState: SharedState<SharedLazyArray.State<E>>;

  constructor(lazyGetFunction: SharedLazyArray.GetFunction<E>) {
    this._SharedState = new SharedState<SharedLazyArray.State<E>>({
      data: [],
      pageEnd: false,
      isError: null,
      isLoading: false,
    });

    this._lazyGetFunction = lazyGetFunction;

    this.lazyGet = this.lazyGet.bind(this);
    this.reset = this.reset.bind(this);
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
          this._lazyGetFunction(data.length, data),
        );

        this._SharedState.setState({
          data: [...data, ...newData],
          isLoading: false,
          pageEnd: newPageEnd || !newData.length,
        });

        return { data: newData, pageEnd: newPageEnd };
      } catch (error) {
        this._SharedState.setState({
          isError: new Error({
            name: 'State Error',
            code: 'LAZY_GET_ERROR',
            message: 'Error lazy getting data',
            severity: 'HIGH',
            info: { ...this._SharedState.state },
          }),
          isLoading: false,
        });
      }
    }

    return null;
  }

  reset() {
    this._SharedState.reset();
  }

  useArray() {
    const [state] = this._SharedState.useState();

    return state;
  }
}
