import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/src/contexts/AuthContext";
import { authStyles as s } from "@/src/constants/auth-styles";
import {
  codigoDeError,
  mensajeDeErrorFirebase,
  validarEmail,
  validarPassword,
} from "@/src/utils/validaciones";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    // 1. Validar en el dispositivo antes de llamar a Firebase.
    const fallaEmail = validarEmail(email, t);
    const fallaPassword = validarPassword(password, t);

    setErrorEmail(fallaEmail);
    setErrorPassword(fallaPassword);
    setErrorGeneral(null);

    if (fallaEmail || fallaPassword) return;

    // 2. Iniciar sesión.
    setCargando(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      setErrorGeneral(mensajeDeErrorFirebase(codigoDeError(e), t));
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={s.pantalla}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Marca */}
          <View style={s.marca}>
            <Image
              source={require("@/assets/images/logos/logoapp.png")}
              style={s.logo}
              resizeMode="contain"
              accessibilityLabel="PaseAR"
            />
            <Text style={s.nombre}>PaseAR</Text>
            <Text style={s.lema}>{t('header.subtitle')}</Text>
          </View>

          {/* Formulario */}
          <View style={s.tarjeta}>
            <Text style={s.titulo}>{t('auth.loginTitle')}</Text>
            <Text style={s.subtitulo}>{t('auth.loginSubtitle')}</Text>

            <TextInput
              style={[s.input, !!errorEmail && s.inputError]}
              placeholder={t('auth.email')}
              placeholderTextColor="#9AAAB6"
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                setErrorEmail(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
            {errorEmail ? <Text style={s.textoError}>{errorEmail}</Text> : null}

            <TextInput
              style={[s.input, !!errorPassword && s.inputError]}
              placeholder={t('auth.password')}
              placeholderTextColor="#9AAAB6"
              value={password}
              onChangeText={(texto) => {
                setPassword(texto);
                setErrorPassword(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={ingresar}
            />
            {errorPassword ? (
              <Text style={s.textoError}>{errorPassword}</Text>
            ) : null}

            {errorGeneral ? (
              <Text style={s.textoError}>{errorGeneral}</Text>
            ) : null}

            <Pressable
              style={[s.boton, cargando && s.botonDeshabilitado]}
              onPress={ingresar}
              disabled={cargando}
              accessibilityRole="button"
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={s.botonTexto}>{t('auth.loginBtn')}</Text>
              )}
            </Pressable>
          </View>

          {/* Enlace a registro */}
          <Link href="/register" asChild>
            <Pressable hitSlop={8}>
              <Text style={s.pie}>
                {t('auth.noAccount')}{" "}
                <Text style={s.pieEnlace}>{t('auth.registerLink')}</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
