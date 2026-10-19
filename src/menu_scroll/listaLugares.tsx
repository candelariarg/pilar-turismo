import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
  Image,
  Dimensions,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../configuracion/FirebaseConfig';
import { useTranslation } from 'react-i18next';
import { imagenesLugares } from './configImagenes';

//obtenemos el ancho de la pantalla para darle un tamaño proporcional a las tarjetas
const { width } = Dimensions.get('window');

interface Lugar {
  id: string;
  Nombre: string;
  Dirección: string;
  Descripción?: string;
  imagen_ruta?: string | null;
  imagen_uri?: string | null;
}

interface SeccionProps {
  coleccion: string; //nombre de la colección en firestore
  titulo: string; //título que se muestra arriba del menú
}

//titulo + menu horizontal
const SeccionLugares = ({ coleccion, titulo }: SeccionProps) => {
  const { t } = useTranslation();
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLugares = async () => {
      try {
        const lugaresRef = collection(db, coleccion);
        const querySnapshot = await getDocs(lugaresRef);
        const lugaresArray: Lugar[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Lugar, 'id'>;
          lugaresArray.push({
            id: doc.id,
            ...data,
          });
        });

        setLugares(lugaresArray);
      } catch (error) {
        console.error(`Error obteniendo ${coleccion}: `, error);
      } finally {
        setLoading(false);
      }
    };

    fetchLugares();
  }, [coleccion]);

  const renderItem: ListRenderItem<Lugar> = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          item.imagen_uri
            ? { uri: item.imagen_uri }
            : item.imagen_ruta
            ? imagenesLugares[item.imagen_ruta]
            : require('../../assets/images/lugaresIniciales/parroquia.jpeg')
        }
        style={styles.imagen}
        resizeMode="cover"
      />
      <Text style={styles.nombre} numberOfLines={1}>
        {item.Nombre}
      </Text>
      <Text style={styles.direccion} numberOfLines={1}>
        {t('map.location')}: {item.Dirección}
      </Text>
      {item.Descripción ? (
        <Text style={styles.descripcion} numberOfLines={2}>
          {item.Descripción}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>{titulo}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ffffff"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};


const LugaresIniciales = () => {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <SeccionLugares
        coleccion="lugares historicos"
        titulo={t('home.historicPlaces', 'Lugares históricos locales')}
      />

      <SeccionLugares
        coleccion="lugares populares"
        titulo={t('home.popularPlaces', 'Lugares populares')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  seccion: {
    marginBottom: 20,
  },
  tituloSeccion: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    marginBottom: 10,
  },
  loader: {
    marginVertical: 30,
  },
  flatListContent: {
    paddingHorizontal: 10, //espacio al inicio y al final del scroll
  },
  card: {
    backgroundColor: 'white',
    padding: 15, //espacio interno de la tarjeta
    borderRadius: 8, //bordes redondeados
    marginRight: 12, //espacio entre tarjetas
    width: width * 0.35, //cada tarjeta ocupa el 35% del ancho de la pantalla
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagen: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  direccion: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 12,
    color: 'gray',
  },
});

export default LugaresIniciales;
