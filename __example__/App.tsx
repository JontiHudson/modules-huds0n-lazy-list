import React from 'react';
import { Text, SafeAreaView } from 'react-native';

import { Button, View } from '@huds0n/components';
import { LazyList, SharedLazyArray } from '@huds0n/lazy-list';
import { timeout } from '@huds0n/utilities';

export default function LazyListPlayground() {
  return (
    <SafeAreaView>
      <LazyList
        SharedLazyArray={DemoLazyState}
        keyName="value"
        ListHeaderComponent={
          <View
            style={{
              height: 50,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>Demo List</Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              height: 50,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button onPress={() => DemoLazyState.reset()}>Refresh</Button>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              height: 150,
              width: '100%',
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>{item.value}</Text>
          </View>
        )}
        style={{ height: '100%', width: '100%', borderWidth: 1 }}
      />
    </SafeAreaView>
  );
}

type DemoElement = { value: number };

const DemoLazyState = new SharedLazyArray<DemoElement>(async (offset) => {
  await timeout(500);

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

    // @ts-ignore
    data.push({ value });
  }

  return { data, pageEnd };
});
