import React from 'react';
import { ActivityIndicator, FlatList as FlatListRN } from 'react-native';

import { FlatList, View } from '@huds0n/components';
import { Core } from '@huds0n/core';
import {
  useAsyncCallback,
  useCallback,
  useEffect,
  useMemo,
} from '@huds0n/utilities';

import { SharedLazyArray } from './SharedLazyArray';
import { theming } from './theming';

export namespace LazyList {
  export type Props<ItemT = any> = Omit<
    FlatList.Props<ItemT>,
    'data' | 'onEndReached'
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
  };

  export type Ref<ItemT = any> = React.Ref<FlatListRN<ItemT>>;

  export type Component<ItemT = any> = React.ForwardRefExoticComponent<
    Props<ItemT> & React.RefAttributes<FlatListRN<ItemT>>
  > & {
    theming: typeof theming;
  };
}

const _LazyList = React.forwardRef<FlatListRN, LazyList.Props>(
  (props: LazyList.Props, ref: LazyList.Ref) => {
    const {
      onRefresh,
      numColumns,
      SharedLazyArray,
      onEndReached,
      showFetchingIndicator = true,
      ListEmptyComponent,
      ListFooterComponent,
      ...flatlistProps
    } = props;

    const { data, isError, pageEnd } = SharedLazyArray.useArray();

    const [fetch, fetching] = useAsyncCallback(async () => {
      await SharedLazyArray.lazyGet();
    });

    useEffect(
      () => {
        if (!pageEnd && !data.length) {
          fetch();
        }
      },
      [!pageEnd && !data.length],
      { layout: 'BEFORE' },
    );

    const onPullToRefresh = useCallback(() => {
      SharedLazyArray.reset();
      return Promise.resolve(onRefresh?.());
    }, [onRefresh]);

    const handleEndReached = useCallback(
      (info: { distanceFromEnd: number }) => {
        onEndReached?.({ ...info, fetching, pageEnd });
        !pageEnd && !fetching && fetch();
      },
      [onEndReached, fetching],
    );

    const _ListFooterComponent = useMemo(() => {
      if (!pageEnd && showFetchingIndicator) {
        return (
          <View
            style={{
              width: '100%',
              alignContent: 'center',
              justifyContent: 'center',
              padding: Core.spacings.L,
            }}
          >
            <ActivityIndicator
              color={flatlistProps.activityIndicatorColor}
              size="large"
            />
          </View>
        );
      }
      if (pageEnd) {
        return ListFooterComponent;
      }
      return null;
    }, [pageEnd, showFetchingIndicator]);

    return (
      <FlatList
        ref={ref}
        onEndReachedThreshold={0.5}
        {...flatlistProps}
        activityIndicatorColor="transparent"
        data={isError ? [] : data}
        numColumns={numColumns}
        ListEmptyComponent={_ListFooterComponent ? null : ListEmptyComponent}
        ListFooterComponent={_ListFooterComponent}
        onEndReached={handleEndReached}
        onPullToRefresh={onPullToRefresh}
      />
    );
  },
);

export const LazyList: LazyList.Component = Object.assign(_LazyList, {
  theming,
});
