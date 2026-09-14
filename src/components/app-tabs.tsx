import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {


  return (
    <NativeTabs
      backgroundColor="black"
      indicatorColor="white"
      labelStyle={{ selected: { color: "white" } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/iconos_barra/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/iconos_barra/map-pin.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="clima">
        <NativeTabs.Trigger.Label>Clima</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/iconos_barra/clima.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/iconos_barra/user.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>      
    </NativeTabs>
  );
}
