import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingAiChat } from '@/src/components/FloatingAiChat';
import { AppHeader } from '@/src/components/app-header';
// Inicializamos el motor i18n globalmente al arrancar
import '@/src/i18n';

// Importamos el componente de pestañas unificado
import AppTabs from '@/src/components/app-tabs';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      
      <AppTabs />
      <FloatingAiChat />
    </SafeAreaProvider>
  );
}
