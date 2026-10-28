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
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../configuracion/FirebaseConfig';
import { useTranslation } from 'react-i18next';
import { imagenesLugares } from './configImagenes';
import EmergenteLugares, { Lugar } from './emergenteLugares';

//ruta de la pantalla del mapa (cambiala por la que uses en tu app)
const RUTA_MAPA = '/mapa';

//obtenemos el ancho de la pantalla para darle un tamaño proporcional a las tarjetas
const { width } = Dimensions.get('window');

interface SeccionProps {
  coleccion: string; //nombre de la colección en firestore
  titulo: string; //título que se muestra arriba del menú
  onSeleccionar: (lugar: Lugar) => void; //se llama al tocar una tarjeta
}

//titulo + menu horizontal
const SeccionLugares = ({ coleccion, titulo, onSeleccionar }: SeccionProps) => {
  const { t } = useTranslation();
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLugares = async () => {
      try {
        const lugaresRef = collection(db, coleccion);
        const querySnapshot = await getDocs(lugaresRef);
        const lugaresArray: Lugar[] = [];

        querySnapshot.forEach((doc: { id: string; data: () => unknown }) => {
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
    <Pressable
      onPress={() => onSeleccionar(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPresionada]}
    >
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
        {t('map.location')}: {item.Direccion}
      </Text>
      {item.Descripcion ? (
        <Text style={styles.descripcion} numberOfLines={2}>
          {item.Descripcion}
        </Text>
      ) : null}
    </Pressable>
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
  const router = useRouter();

  //lugar que se está mostrando en la ventana emergente (null = cerrada)
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(null);

  const irAlMapa = (lugar: Lugar) => {
    setLugarSeleccionado(null); //cerramos la ventana antes de navegar
    router.push({
      pathname: RUTA_MAPA,
      params: {
        nombre: lugar.Nombre,
        direccion: lugar.Direccion,
      },
    });
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <SeccionLugares
          coleccion="lugares historicos"
          titulo={t('home.historicPlaces', 'Lugares históricos locales')}
          onSeleccionar={setLugarSeleccionado}
        />

        <SeccionLugares
          coleccion="lugares populares"
          titulo={t('home.popularPlaces', 'Lugares populares')}
          onSeleccionar={setLugarSeleccionado}
        />
      </ScrollView>

      <EmergenteLugares
        lugar={lugarSeleccionado}
        onCerrar={() => setLugarSeleccionado(null)}
        onVerMapa={irAlMapa}
      />
    </>
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
    width: width * 0.30, //cada tarjeta ocupa el 30% del ancho de la pantalla
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPresionada: {
    opacity: 0.8, //efecto visual al tocar la tarjeta
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