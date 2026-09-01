import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text>Mapa</Text>
      </SafeAreaView>
    </ThemedView>
  );
}