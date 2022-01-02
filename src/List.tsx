import React from 'react';
import { ActivityIndicator, FlatList as FlatListRN, View } from 'react-native';

import { FlatList, Icon } from '@huds0n/components';
import { theme } from '@huds0n/theming/src/theme';
import {
  useAsyncCallback,
  useCallback,
  useEffect,
  useMemo,
} from '@huds0n/utilities';

import { SharedLazyArray } from './SharedLazyArray';

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
    errorIcon?: false | Icon.Props;
  };

  export type Ref<ItemT = any> = React.Ref<FlatListRN<ItemT>>;

  export type Component<ItemT = any> = React.ForwardRefExoticComponent<
    Props<ItemT> & React.RefAttributes<FlatListRN<ItemT>>
  >;
}

const DEFAULT_ERROR_ICON = {
  set: 'AntDesign',
  name: 'warning',
  size: 24,
} as const;

export const LazyList = React.forwardRef<FlatListRN, LazyList.Props>(
  (props: LazyList.Props, ref: LazyList.Ref) => {
    const {
      onRefresh,
      numColumns,
      SharedLazyArray,
      onEndReached,
      showFetchingIndicator = true,
      ListEmptyComponent,
      ListFooterComponent,
      errorIcon = DEFAULT_ERROR_ICON,
      ...flatlistProps
    } = props;

    const { data, isError, pageEnd } = SharedLazyArray.use();

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
      if (isError && errorIcon) {
        return (
          <View
            style={{
              width: '100%',
              alignContent: 'center',
              justifyContent: 'center',
              padding: theme.spacings.L,
            }}
          >
            <Icon {...errorIcon} />
          </View>
        );
      }
      if (!pageEnd && showFetchingIndicator) {
        return (
          <View
            style={{
              width: '100%',
              alignContent: 'center',
              justifyContent: 'center',
              padding: theme.spacings.L,
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
    }, [isError, pageEnd, showFetchingIndicator]);

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
