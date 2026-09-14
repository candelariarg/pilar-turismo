import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Inicializamos el motor i18n globalmente al arrancar
import '@/src/i18n';

// Importamos el componente de pestañas unificado
import AppTabs from '@/src/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AppTabs />
    </SafeAreaProvider>
  );
}
