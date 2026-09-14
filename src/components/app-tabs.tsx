import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { HapticTab } from '@/src/components/haptic-tab';

export default function AppTabs() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const isDark = colorScheme === 'dark';

  const activeColor = isDark ? '#FFFFFF' : '#208AEF';
  const inactiveColor = isDark ? '#8E8E93' : '#687076';
  const barBackground = isDark ? '#121212' : '#FFFFFF';
  const borderColor = isDark ? '#27272A' : '#E5E7EB';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: "#2196F3",
          borderTopColor: "#2196F3",
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* Pestaña: INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('@/assets/iconos_barra/home.png')}
              style={[
                styles.icon,
                { tintColor: color, opacity: focused ? 1 : 0.75 },
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
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('@/assets/iconos_barra/map-pin.png')}
              style={[
                styles.icon,
                { tintColor: color, opacity: focused ? 1 : 0.75 },
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
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('@/assets/iconos_barra/clima.png')}
              style={[
                styles.icon,
                { tintColor: color, opacity: focused ? 1 : 0.75 },
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
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('@/assets/iconos_barra/user.png')}
              style={[
                styles.icon,
                { tintColor: color, opacity: focused ? 1 : 0.75 },
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
    width: 24,
    height: 24,
  },
});
