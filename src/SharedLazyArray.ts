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

export class SharedLazyArray<E> extends SharedState<SharedLazyArray.State<E>> {
  private _lazyGetFunction: SharedLazyArray.GetFunction<E>;

  constructor(lazyGetFunction: SharedLazyArray.GetFunction<E>) {
    super({
      data: [],
      pageEnd: false,
      isError: null,
      isLoading: false,
    });

    this._lazyGetFunction = lazyGetFunction;

    this.lazyGet = this.lazyGet.bind(this);
    this.useArray = this.useArray.bind(this);
  }

  get data() {
    return this.state.data;
  }

  async lazyGet(options?: { reset: boolean }) {
    if (options?.reset) this.reset();

    const { data, pageEnd } = this.state;

    if (!pageEnd) {
      this.setState({ isLoading: true });

      try {
        const { data: newData, pageEnd: newPageEnd } = await Promise.resolve(
          this._lazyGetFunction(data.length, data),
        );

        this.setState({
          data: [...data, ...newData],
          isLoading: false,
          pageEnd: newPageEnd || !newData.length,
        });

        return { data: newData, pageEnd: newPageEnd };
      } catch (error) {
        this.setState({
          isError: new Error({
            name: 'State Error',
            code: 'LAZY_GET_ERROR',
            message: 'Error lazy getting data',
            severity: 'HIGH',
            info: { ...this.state },
          }),
          isLoading: false,
        });
      }
    }

    return null;
  }

  useArray() {
    const [state] = super.useState(['data', 'isError', 'isLoading', 'pageEnd']);

    return state;
  }
}
