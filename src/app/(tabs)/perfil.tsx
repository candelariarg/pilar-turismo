import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/src/components/themed-view';
import { SwipeableScreen } from '@/src/components/swipeable-screen';
import { AppHeader } from '@/src/components/app-header';
import { useAuth } from '@/src/contexts/AuthContext';
import { confirmar } from '@/src/utils/confirmar';
import { codigoDeError, mensajeDeErrorFirebase } from '@/src/utils/validaciones';

export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  const {
    user,
    logout,
    emailVerificado,
    verificarEmail,
    recargarUsuario,
    cambiarPassword,
  } = useAuth();

  const [imageUrl, setImageurl] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleToggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const cambiarFotoPerfil = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('common.error'), t('common.galleryPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageurl(result.assets[0].uri);
    }
  };

  /** Reenvía el correo de verificación de la dirección. */
  const enviarVerificacion = async () => {
    setEnviando(true);
    setMensaje(null);

    try {
      await verificarEmail();
      setMensaje(t('profile.verificationSent', { email: user?.email }));
    } catch (e) {
      setMensaje(mensajeDeErrorFirebase(codigoDeError(e)));
    } finally {
      setEnviando(false);
    }
  };

  /** Vuelve a leer el usuario para ver si ya abrió el enlace del correo. */
  const comprobarVerificacion = async () => {
    setMensaje(null);

    try {
      const verificado = await recargarUsuario();
      setMensaje(
        verificado
          ? t('profile.emailVerifiedSuccess')
          : t('profile.emailNotYetVerified'),
      );
    } catch {
      setMensaje(t('profile.checkError'));
    }
  };

  /**
   * Firebase envía un correo con un enlace para crear una contraseña nueva.
   *
   * Se usa el restablecimiento por correo y no updatePassword porque
   * updatePassword exige un login reciente (auth/requires-recent-login).
   */
  const solicitarCambioPassword = async () => {
    const email = user?.email;
    if (!email) {
      setMensaje(t('profile.noEmailFound'));
      return;
    }

    const acepta = await confirmar({
      titulo: t('profile.changePassword'),
      mensaje: t('profile.passwordResetMessage', { email }),
      textoAceptar: t('common.accept'),
      textoCancelar: t('common.cancel'),
    });
    if (!acepta) return;

    setEnviando(true);
    setMensaje(null);

    try {
      await cambiarPassword(email);
      setMensaje(t('profile.passwordResetSent', { email }));
    } catch (e) {
      setMensaje(mensajeDeErrorFirebase(codigoDeError(e)));
    } finally {
      setEnviando(false);
    }
  };

  // Cierra la sesión. La vuelta al login la maneja el layout raíz
  // en cuanto Firebase actualiza el estado `user`.
  const cerrarSesion = async () => {
    const acepta = await confirmar({
      titulo: t('profile.logout'),
      mensaje: t('profile.logoutConfirm'),
      textoAceptar: t('profile.logout'),
      textoCancelar: t('common.cancel'),
    });
    if (!acepta) return;

    try {
      await logout();
    } catch {
      Alert.alert(t('common.error'), t('profile.logoutError'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SwipeableScreen currentTab="perfil">
        <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader />
        {/* Encabezado Azul */}
        <View style={styles.header}>
          <Image
            source={imageUrl ? { uri: imageUrl } : require('@/assets/images/logos/usuario.png')}
            style={styles.avatarPlaceholder}
          />
          <Text style={styles.nombreUsuario} numberOfLines={1}>
            {user?.email ?? t('profile.userDefaultName')}
          </Text>

          {/* Botón para cambiar foto */}
          <TouchableOpacity style={styles.botonFoto} onPress={cambiarFotoPerfil}>
            <Text style={styles.textoBotonFoto}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones de Ajustes */}
        <View style={styles.seccionAjustes}>
          {/* Estado del correo */}
          <View style={styles.filaEstado}>
            <Text style={styles.etiquetaEstado}>{t('profile.emailLabel')}</Text>
            <Text
              style={[
                styles.valorEstado,
                emailVerificado ? styles.verificado : styles.sinVerificar,
              ]}
            >
              {emailVerificado ? t('profile.verified') : t('profile.unverified')}
            </Text>
          </View>

          {!emailVerificado && (
            <TouchableOpacity
              style={styles.botonOpcion}
              onPress={enviarVerificacion}
              disabled={enviando}
            >
              <Text style={styles.textoOpcion}>
                {enviando ? t('profile.sendingEmail') : t('profile.verifyEmail')}
              </Text>
            </TouchableOpacity>
          )}

          {!emailVerificado && (
            <TouchableOpacity style={styles.botonOpcion} onPress={comprobarVerificacion}>
              <Text style={styles.textoOpcion}>{t('profile.alreadyVerified')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botonOpcion} onPress={handleToggleLanguage}>
            <Text style={styles.textoOpcion}>
              {t('profile.changeLanguage')} ({t('profile.currentLanguage')})
            </Text>
          </TouchableOpacity>

          {/* Cambio de contraseña */}
          <TouchableOpacity
            style={styles.botonOpcion}
            onPress={solicitarCambioPassword}
            disabled={enviando}
          >
            <Text style={styles.textoOpcion}>
              {enviando ? t('profile.sendingEmail') : t('profile.changePassword')}
            </Text>
          </TouchableOpacity>

          {mensaje ? <Text style={styles.mensajeInfo}>{mensaje}</Text> : null}
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
          <Text style={styles.textoSalir}>{t('profile.logout')}</Text>
        </TouchableOpacity>

      </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  nombreUsuario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  botonFoto: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  textoBotonFoto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  seccionAjustes: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filaEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  etiquetaEstado: {
    fontSize: 16,
    color: '#333333',
  },
  valorEstado: {
    fontSize: 14,
    fontWeight: '600',
  },
  verificado: {
    color: '#2E7D32',
  },
  sinVerificar: {
    color: '#C62828',
  },
  botonOpcion: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  textoOpcion: {
    fontSize: 16,
    color: '#333333',
  },
  mensajeInfo: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: '#0068B3',
  },
  botonSalir: {
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fa1818',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  textoSalir: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  }
});
