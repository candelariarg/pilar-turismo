import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/src/i18n";

import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

/** Las únicas pantallas a las que se puede entrar sin sesión. */
const PANTALLAS_PUBLICAS = ["login", "register"];

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  /**
   * Redirige al login cuando no hay sesión.
   *
   * Reacciona al estado `user` en lugar de navegar justo después de
   * signOut(), porque `onAuthStateChanged` de Firebase se actualiza
   * de forma asíncrona: si navegáramos antes, /login todavía estaría
   * bloqueado por el guard de abajo y la navegación se perdería.
   */
  useEffect(() => {
    if (loading) return;

    const enPantallaPublica = PANTALLAS_PUBLICAS.includes(segments[0]);
    if (!user && !enPantallaPublica) {
      router.replace("/login");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0068B3" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!!user}>
          {/* Boolean(user) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
