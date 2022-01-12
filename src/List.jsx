"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyList = void 0;
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const react_native_1 = require("react-native");
const components_1 = require("@huds0n/components");
const theme_1 = require("@huds0n/theming/src/theme");
const utilities_1 = require("@huds0n/utilities");
const DEFAULT_ERROR_ICON = {
    set: "AntDesign",
    name: "warning",
    size: 24,
};
exports.LazyList = react_1.default.forwardRef((props, ref) => {
    const { onRefresh, numColumns, SharedLazyArray, onEndReached, showFetchingIndicator = true, ListEmptyComponent, ListFooterComponent, errorIcon = DEFAULT_ERROR_ICON, ...flatlistProps } = props;
    const { data, isError, pageEnd } = SharedLazyArray.use();
    const [fetch, fetching] = (0, utilities_1.useAsyncCallback)(async () => {
        await SharedLazyArray.lazyGet();
    });
    (0, utilities_1.useEffect)(() => {
        if (!pageEnd && !data.length) {
            fetch();
        }
    }, [!pageEnd && !data.length], { layout: "BEFORE" });
    const onPullToRefresh = (0, utilities_1.useCallback)(() => {
        SharedLazyArray.reset();
        return Promise.resolve(onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh());
    }, [onRefresh]);
    const handleEndReached = (0, utilities_1.useCallback)((info) => {
        onEndReached === null || onEndReached === void 0 ? void 0 : onEndReached({ ...info, fetching, pageEnd });
        !pageEnd && !fetching && fetch();
    }, [onEndReached, fetching]);
    const _ListFooterComponent = (0, utilities_1.useMemo)(() => {
        if (isError && errorIcon) {
            return (<react_native_1.View style={{
                    width: "100%",
                    alignContent: "center",
                    justifyContent: "center",
                    padding: theme_1.theme.spacings.L,
                }}>
            <components_1.Icon {...errorIcon}/>
          </react_native_1.View>);
        }
        if (!pageEnd && showFetchingIndicator) {
            return (<react_native_1.View style={{
                    width: "100%",
                    alignContent: "center",
                    justifyContent: "center",
                    padding: theme_1.theme.spacings.L,
                }}>
            <react_native_1.ActivityIndicator color={flatlistProps.activityIndicatorColor} size="large"/>
          </react_native_1.View>);
        }
        if (pageEnd) {
            return ListFooterComponent;
        }
        return null;
    }, [isError, pageEnd, showFetchingIndicator]);
    return (<components_1.FlatList ref={ref} onEndReachedThreshold={0.5} {...flatlistProps} activityIndicatorColor="transparent" data={isError ? [] : data} numColumns={numColumns} ListEmptyComponent={_ListFooterComponent ? null : ListEmptyComponent} ListFooterComponent={_ListFooterComponent} onEndReached={handleEndReached} onPullToRefresh={onPullToRefresh}/>);
});
