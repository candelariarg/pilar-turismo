import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingAiChat } from '@/src/components/FloatingAiChat';
import { Text, Image } from 'react-native';
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
      <View style={{ backgroundColor: '#2196F3', padding: 16 }}>
        <Image 
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 200, height: 200, alignSelf: 'center', marginTop: 50 }} 
          />
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 20, color: '#FFFFFF' }}>
          Pilar Turismo
        </Text>
      </View>
      <AppTabs />
      <FloatingAiChat />
    </SafeAreaProvider>
  );
}
