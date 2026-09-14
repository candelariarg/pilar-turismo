import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/src/components/themed-view';
import { SwipeableScreen } from '@/src/components/swipeable-screen';

export default function ExploreScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SwipeableScreen currentTab="explore">
        <SafeAreaView style={{ flex: 1, padding: 16 }} edges={['top']}>
          <Text>Mapa</Text>
        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}