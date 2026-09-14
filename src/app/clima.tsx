import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/src/components/themed-view';
import { SwipeableScreen } from '@/src/components/swipeable-screen';

export default function ClimaScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SwipeableScreen currentTab="clima">
        <SafeAreaView style={{ flex: 1, padding: 16 }} edges={['top']}>
          <Text>Clima</Text>
        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}