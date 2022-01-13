"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = (0, tslib_1.__importDefault)(require("react"));
const react_native_1 = require("react-native");
const components_1 = require("@huds0n/components");
const lazy_list_1 = require("@huds0n/lazy-list");
const utilities_1 = require("@huds0n/utilities");
function LazyListPlayground() {
    return (<react_native_1.SafeAreaView>
      <lazy_list_1.LazyList SharedLazyArray={DemoLazyState} keyName="value" ListHeaderComponent={<react_native_1.View style={{
                height: 50,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <react_native_1.Text>Demo List</react_native_1.Text>
          </react_native_1.View>} ListFooterComponent={<react_native_1.View style={{
                height: 50,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <components_1.Button onPress={() => DemoLazyState.reset()}>Refresh</components_1.Button>
          </react_native_1.View>} renderItem={({ item }) => (<react_native_1.View style={{
                height: 150,
                width: '100%',
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <react_native_1.Text>{item.value}</react_native_1.Text>
          </react_native_1.View>)} style={{ height: '100%', width: '100%', borderWidth: 1 }}/>
    </react_native_1.SafeAreaView>);
}
exports.default = LazyListPlayground;
const DemoLazyState = new lazy_list_1.SharedLazyArray(async (offset) => {
    await (0, utilities_1.timeout)(500);
    let value = offset;
    const data = [];
    let elementNum = 0;
    let pageEnd = false;
    while (elementNum < 10) {
        elementNum++;
        value++;
        if (value > 50) {
            pageEnd = true;
            break;
        }
        data.push({ value });
    }
    return { data, pageEnd };
});
