import React from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { imagenesLugares } from './configImagenes';

export interface Lugar {
  id: string;
  Nombre: string;
  Direccion: string;
  Descripcion?: string;
  imagen_ruta?: string | null;
  imagen_uri?: string | null;
}

interface EmergenteLugaresProps {
  lugar: Lugar | null; //si es null la ventana está cerrada
  onCerrar: () => void; //se llama al cerrar la ventana
  onVerMapa: (lugar: Lugar) => void; //se llama al tocar la ubicación azul
}

//devuelve la imagen correcta del lugar (uri, imagen local o imagen por defecto)
const obtenerImagen = (lugar: Lugar): ImageSourcePropType => {
  if (lugar.imagen_uri) return { uri: lugar.imagen_uri };
  if (lugar.imagen_ruta) return imagenesLugares[lugar.imagen_ruta];
  return require('../../assets/images/lugaresIniciales/parroquia.jpeg');
};

const EmergenteLugares = ({ lugar, onCerrar, onVerMapa }: EmergenteLugaresProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={lugar !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onCerrar} //botón atrás en Android
    >
      {/* fondo oscuro: al tocarlo se cierra */}
      <Pressable style={styles.fondoModal} onPress={onCerrar}>
        {/* este Pressable evita que tocar dentro de la ventana la cierre */}
        <Pressable style={styles.ventanaModal} onPress={() => {}}>
          {lugar && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={obtenerImagen(lugar)}
                style={styles.imagenModal}
                resizeMode="cover"
              />

              <Text style={styles.nombreModal}>{lugar.Nombre}</Text>

              {lugar.Descripcion ? (
                <Text style={styles.descripcionModal}>{lugar.Descripcion}</Text>
              ) : null}

              <Text style={styles.etiquetaUbicacion}>{t('map.location')}</Text>
              <Pressable onPress={() => onVerMapa(lugar)} hitSlop={8}>
                <Text style={styles.ubicacionLink}>{lugar.Direccion}</Text>
              </Pressable>

              <Pressable style={styles.botonCerrar} onPress={onCerrar}>
                <Text style={styles.textoBotonCerrar}>{t('common.close', 'Cerrar')}</Text>
              </Pressable>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ventanaModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  imagenModal: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    marginBottom: 14,
  },
  nombreModal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  descripcionModal: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 14,
  },
  etiquetaUbicacion: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 2,
  },
  ubicacionLink: {
    fontSize: 16,
    color: '#1E88E5',
    textDecorationLine: 'underline',
    marginBottom: 18,
  },
  botonCerrar: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmergenteLugares;