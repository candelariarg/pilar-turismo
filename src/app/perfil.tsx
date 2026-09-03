import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';

export default function PerfilScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Encabezado Azul*/}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.nombreUsuario}>Nombre del Turista</Text>
          
          {/* Botón para integrar la cámara */}
          <TouchableOpacity style={styles.botonFoto}>
            <Text style={styles.textoBotonFoto}>Cambiar foto de perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones de Ajustes */}
        <View style={styles.seccionAjustes}>
          <TouchableOpacity style={styles.botonOpcion}>
            <Text style={styles.textoOpcion}>Cambiar Idioma</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonOpcion}>
            <Text style={styles.textoOpcion}>Alertas Climáticas</Text>
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.botonSalir}>
          <Text style={styles.textoSalir}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </ThemedView>
  );
}

// Estilos locales temporales 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // color de fondo claro para no cansar la vista
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#2196F3', // Azul brillante principal
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fondo semitransparente
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
    borderColor: '#fa1818', // Borde rojo para la acción de salir
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