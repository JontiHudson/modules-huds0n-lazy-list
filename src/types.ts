import { FlatList } from "react-native";
import { ComponentTypes } from "@huds0n/components";

import type { SharedLazyArray } from "./SharedLazyArray";

export declare namespace Types {
  export type LazyGet<E> = (
    offset: number,
    data: E[]
  ) => LazyGetResult<E> | Promise<LazyGetResult<E>>;

  export type LazyGetResult<E> = { data: E[]; pageEnd?: boolean };

  export type LazyListProps<ItemT = any> = Omit<
    ComponentTypes.FlatListProps<ItemT>,
    "data" | "onEndReached"
  > & {
    onEndReached?:
      | ((info: {
          distanceFromEnd: number;
          pageEnd?: boolean;
          fetching?: boolean;
        }) => void)
      | null;
    onRefresh?: () => void | Promise<void>;
    SharedLazyArray: SharedLazyArray<ItemT>;
    showFetchingIndicator?: boolean;
    errorIcon?: false | ComponentTypes.IconProps;
  };

  export type LazyListRef<ItemT = any> = React.Ref<FlatList<ItemT>>;

  export type LazyListComponent<ItemT = any> = React.ForwardRefExoticComponent<
    LazyListProps<ItemT> & React.RefAttributes<FlatList<ItemT>>
  >;
}
