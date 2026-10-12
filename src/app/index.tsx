import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/src/components/themed-view';
import { SwipeableScreen } from '@/src/components/swipeable-screen';
import LugaresIniciales from '@/src/menu_scroll/listaLugares';

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SwipeableScreen currentTab="index">
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <LugaresIniciales />
        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}
