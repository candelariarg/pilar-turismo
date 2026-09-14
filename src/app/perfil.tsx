import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/src/components/themed-view';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

export default function PerfilScreen() {
  const { t, i18n } = useTranslation();

  const handleToggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const [imageUrl, setImageurl] = useState<string | null>(null);

  const cambiarFotoPerfil = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t('common.error'), 'Se requiere acceso a la galería.');
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Encabezado Azul */}
        <View style={styles.header}>
          <Image
            source={{ uri: imageUrl || 'https://picsum.photos/200' }}
            style={styles.avatarPlaceholder}
          />
          <Text style={styles.nombreUsuario}>{t('profile.userDefaultName')}</Text>
          
          {/* Botón para cambiar foto */}
          <TouchableOpacity style={styles.botonFoto} onPress={cambiarFotoPerfil}>
            <Text style={styles.textoBotonFoto}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones de Ajustes */}
        <View style={styles.seccionAjustes}>
          <TouchableOpacity style={styles.botonOpcion} onPress={handleToggleLanguage}>
            <Text style={styles.textoOpcion}>
              {t('profile.changeLanguage')} ({t('profile.currentLanguage')})
            </Text>
          </TouchableOpacity>

          {/* Botón de cambio de contraseña */}
          <TouchableOpacity style={styles.botonOpcion}>
            <Text style={styles.textoOpcion}>{t('profile.changePassword')}</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.botonSalir}>
          <Text style={styles.textoSalir}>{t('profile.logout')}</Text>
        </TouchableOpacity>

      </SafeAreaView>
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
  botonOpcion: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  textoOpcion: {
    fontSize: 16,
    color: '#333333',
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