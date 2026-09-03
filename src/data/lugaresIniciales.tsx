import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ListRenderItem } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../configuracion/FirebaseConfig';

//Definimos la estructura de los datos según la base de datos
interface Lugar {
  id: string;
  Nombre: string;
  Dirección: string;
  Descripción?: string;
  imagen_uri?: string | null;
}

const LugaresIniciales = () => {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLugares = async () => {
      try {
        const lugaresRef = collection(db, "lugares iniciales");
        const querySnapshot = await getDocs(lugaresRef);

        const lugaresArray: Lugar[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Lugar, 'id'>;
          lugaresArray.push({
            id: doc.id,
            ...data
          });
        });

        setLugares(lugaresArray);
      } catch (error) {
        console.error("Error obteniendo los lugares: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLugares();
  }, []);

  const renderItem: ListRenderItem<Lugar> = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>{item.Nombre}</Text>
      <Text style={styles.direccion}>Ubicación: {item.Dirección}</Text>
      {item.Descripción ? <Text style={styles.descripcion}>{item.Descripción}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lugares}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  direccion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 14,
    color: '#444',
  },
});

export default LugaresIniciales;