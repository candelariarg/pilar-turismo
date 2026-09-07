import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// 1. Importamos el hook de traducción
import { useTranslation } from 'react-i18next';

// 2. Importamos el componente de iconos
import { IconSymbol } from '@/src/components/icon-symbol';

// 3. Inicializamos el motor i18n globalmente al arrancar
import '@/src/i18n';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // 4. Obtenemos la función 't' para traducir los títulos de las pestañas
  const { t } = useTranslation();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Pestaña: INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'), // Muestra "Inicio" o "Home"
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Pestaña: MAPA */}
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.map'), // Muestra "Mapa" o "Map"
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />

      {/* Pestaña: CLIMA */}
      <Tabs.Screen
        name="clima"
        options={{
          title: t('tabs.weather'), // Muestra "Clima" o "Weather"
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.right" color={color} />,
        }}
      />

      {/* Pestaña: PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('tabs.profile'), // Muestra "Perfil" o "Profile"
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.left.forwardslash.chevron.right" color={color} />,
        }}
      />
    </Tabs>
  );
}
