import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingAiChat } from '@/src/components/FloatingAiChat';
import { AppHeader } from '@/src/components/app-header';
// Inicializamos el motor i18n globalmente al arrancar
import '@/src/i18n';

// Importamos el componente de pestañas unificado
import AppTabs from '@/src/components/app-tabs';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      
      <AppTabs />
      <FloatingAiChat />
    </SafeAreaProvider>
  );
}
