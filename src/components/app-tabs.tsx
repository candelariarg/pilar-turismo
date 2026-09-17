import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { HapticTab } from '@/src/components/haptic-tab';

export default function AppTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Color de fondo de la barra y contraste óptimo
  const barBackground = '#0068B3';
  const borderTopColor = '#0068B3';
  const activeColor = '#FFFFFF';
  const inactiveColor = 'rgba(255, 255, 255, 0.65)';

  // Manejo dinámico de zona segura inferior (botones de Android, barra de gestos, Home bar de iOS)
  const bottomInset = insets.bottom;
  const paddingBottom = bottomInset > 0 ? bottomInset + 4 : 8;
  const barHeight = 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarButton: HapticTab,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: barBackground,
          borderTopColor: borderTopColor,
          borderTopWidth: 1,
          height: barHeight,
          paddingTop: 6,
          paddingBottom: paddingBottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Pestaña: INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/iconos_barra/home.png')}
              style={[
                styles.icon,
                { tintColor: color },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Pestaña: MAPA */}
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/iconos_barra/map-pin.png')}
              style={[
                styles.icon,
                { tintColor: color },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Pestaña: CLIMA */}
      <Tabs.Screen
        name="clima"
        options={{
          title: t('tabs.weather'),
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/iconos_barra/clima.png')}
              style={[
                styles.icon,
                { tintColor: color },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Pestaña: PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/iconos_barra/user.png')}
              style={[
                styles.icon,
                { tintColor: color },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
  },
});
