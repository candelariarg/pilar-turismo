import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
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
    actualizarNombre,
  } = useAuth();

  const [imageUrl, setImageurl] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Estados para modal de editar nombre de usuario
  const [modalNombreVisible, setModalNombreVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

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

  /** Guarda el nuevo nombre del usuario en Firebase Auth */
  const handleGuardarNombre = async () => {
    const trimmed = nuevoNombre.trim();
    if (!trimmed) {
      Alert.alert(t('common.error'), t('profile.nameEmpty'));
      return;
    }

    setGuardandoNombre(true);
    setMensaje(null);
    try {
      await actualizarNombre(trimmed);
      setModalNombreVisible(false);
      setMensaje(t('profile.nameUpdated'));
    } catch (e) {
      Alert.alert(t('common.error'), mensajeDeErrorFirebase(codigoDeError(e), t));
    } finally {
      setGuardandoNombre(false);
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
      setMensaje(mensajeDeErrorFirebase(codigoDeError(e), t));
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
      setMensaje(mensajeDeErrorFirebase(codigoDeError(e), t));
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

  // Nombre para mostrar: displayName, o prefijo del email, o valor por defecto
  const nombreParaMostrar =
    user?.displayName || (user?.email ? user.email.split('@')[0] : t('profile.userDefaultName'));

  return (
    <ThemedView style={styles.container}>
      <SwipeableScreen currentTab="perfil">
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <AppHeader />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Encabezado Azul */}
            <View style={styles.header}>
              <Image
                source={imageUrl ? { uri: imageUrl } : require('@/assets/images/logos/usuario.png')}
                style={styles.avatarPlaceholder}
              />

              {/* Nombre de usuario con botón de editar */}
              <View style={styles.nombreContainer}>
                <Text style={styles.nombreUsuario} numberOfLines={1}>
                  {nombreParaMostrar}
                </Text>
                <TouchableOpacity
                  style={styles.btnEditarNombreMini}
                  onPress={() => {
                    setNuevoNombre(user?.displayName ?? '');
                    setModalNombreVisible(true);
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="pencil" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Botón para cambiar foto */}
              <TouchableOpacity style={styles.botonFoto} onPress={cambiarFotoPerfil}>
                <Text style={styles.textoBotonFoto}>{t('profile.changePhoto')}</Text>
              </TouchableOpacity>
            </View>

            {/* Opciones de Ajustes */}
            <View style={styles.seccionAjustes}>
              {/* Cambiar nombre de usuario */}
              <TouchableOpacity
                style={styles.botonOpcion}
                onPress={() => {
                  setNuevoNombre(user?.displayName ?? '');
                  setModalNombreVisible(true);
                }}
              >
                <Text style={styles.textoOpcion}>{t('profile.editName')}</Text>
              </TouchableOpacity>

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

            {/* Botón de Cerrar Sesión con separación clara */}
            <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
              <Text style={styles.textoSalir}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Modal para editar nombre de usuario */}
          <Modal
            visible={modalNombreVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalNombreVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalFondo}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalCardTitulo}>{t('profile.editNameTitle')}</Text>
                <Text style={styles.modalCardSubtitulo}>{t('profile.nameSubtitle')}</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder={t('profile.namePlaceholder')}
                  placeholderTextColor="#9AAAB6"
                  value={nuevoNombre}
                  onChangeText={setNuevoNombre}
                  autoFocus={true}
                  maxLength={30}
                />

                <View style={styles.modalBotonesRow}>
                  <TouchableOpacity
                    style={styles.modalBtnCancelar}
                    onPress={() => setModalNombreVisible(false)}
                    disabled={guardandoNombre}
                  >
                    <Text style={styles.modalBtnCancelarTexto}>{t('common.cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtnGuardar, guardandoNombre && { opacity: 0.7 }]}
                    onPress={handleGuardarNombre}
                    disabled={guardandoNombre}
                  >
                    {guardandoNombre ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalBtnGuardarTexto}>{t('common.save')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  nombreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  nombreUsuario: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    maxWidth: '85%',
  },
  btnEditarNombreMini: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 6,
    borderRadius: 14,
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
    borderWidth: 1.5,
    borderColor: '#fa1818',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  textoSalir: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },

  // Estilos del modal para editar nombre
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCardTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  modalCardSubtitulo: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
  },
  modalBotonesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancelarTexto: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBtnGuardar: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  modalBtnGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
