import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import LugaresIniciales from '../data/lugaresIniciales';

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <LugaresIniciales />
      </SafeAreaView>
    </ThemedView>
  );
}



