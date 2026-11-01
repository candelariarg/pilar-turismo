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
  validarConfirmacion,
  validarEmail,
  validarPassword,
} from "@/src/utils/validaciones";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const registrarse = async () => {
    // 1. Validar en el dispositivo antes de llamar a Firebase.
    const fallaEmail = validarEmail(email, t);
    const fallaPassword = validarPassword(password, t);
    const fallaConfirmacion = validarConfirmacion(password, confirmacion, t);

    setErrorEmail(fallaEmail);
    setErrorPassword(fallaPassword);
    setErrorConfirmacion(fallaConfirmacion);
    setErrorGeneral(null);

    if (fallaEmail || fallaPassword || fallaConfirmacion) return;

    // 2. Crear la cuenta.
    setCargando(true);
    try {
      await register(email.trim(), password);
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
            <Text style={s.titulo}>{t('auth.registerTitle')}</Text>
            <Text style={s.subtitulo}>{t('auth.registerSubtitle')}</Text>

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
              autoComplete="password-new"
              textContentType="newPassword"
            />
            {errorPassword ? (
              <Text style={s.textoError}>{errorPassword}</Text>
            ) : null}

            <TextInput
              style={[s.input, !!errorConfirmacion && s.inputError]}
              placeholder={t('auth.repeatPassword')}
              placeholderTextColor="#9AAAB6"
              value={confirmacion}
              onChangeText={(texto) => {
                setConfirmacion(texto);
                setErrorConfirmacion(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={registrarse}
            />
            {errorConfirmacion ? (
              <Text style={s.textoError}>{errorConfirmacion}</Text>
            ) : null}

            {errorGeneral ? (
              <Text style={s.textoError}>{errorGeneral}</Text>
            ) : null}

            <Pressable
              style={[s.boton, cargando && s.botonDeshabilitado]}
              onPress={registrarse}
              disabled={cargando}
              accessibilityRole="button"
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={s.botonTexto}>{t('auth.registerBtn')}</Text>
              )}
            </Pressable>
          </View>

          {/* Enlace a login */}
          <Link href="/login" asChild>
            <Pressable hitSlop={8}>
              <Text style={s.pie}>
                {t('auth.alreadyHaveAccount')}{" "}
                <Text style={s.pieEnlace}>{t('auth.loginLink')}</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
