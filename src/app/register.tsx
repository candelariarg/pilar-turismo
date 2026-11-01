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
    const fallaEmail = validarEmail(email);
    const fallaPassword = validarPassword(password);
    const fallaConfirmacion = validarConfirmacion(password, confirmacion);

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
      setErrorGeneral(mensajeDeErrorFirebase(codigoDeError(e)));
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
            <Text style={s.lema}>Descubrí tu próximo destino!</Text>
          </View>

          {/* Formulario */}
          <View style={s.tarjeta}>
            <Text style={s.titulo}>Crear cuenta</Text>
            <Text style={s.subtitulo}>Completá tus datos para empezar</Text>

            <TextInput
              style={[s.input, !!errorEmail && s.inputError]}
              placeholder="Email"
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
              placeholder="Contraseña"
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
              placeholder="Repetir contraseña"
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
                <Text style={s.botonTexto}>Crear cuenta</Text>
              )}
            </Pressable>
          </View>

          {/* Enlace a login */}
          <Link href="/login" asChild>
            <Pressable hitSlop={8}>
              <Text style={s.pie}>
                ¿Ya tenés cuenta?{" "}
                <Text style={s.pieEnlace}>Iniciá sesión</Text>
              </Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
