import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/src/components/themed-view';
import { SwipeableScreen } from '@/src/components/swipeable-screen';

const { width } = Dimensions.get('window');

// lugares de muestra 
interface Lugar {
  id: string;
  nombre: string;
  categoria: 'hospital' | 'comisaria' | 'supermercado' | 'sum' | 'turismo';
  categoriaText: string;
  icono: string;
  color: string;
  direccion: string;
  distancia: string;
  tiempo: string;
  coordenadasSimuladas: { top: number; left: number };
}

// datos de prueba para el jueves 
const LUGARES_PILAR: Lugar[] = [
  {
    id: '1',
    nombre: 'Hospital Central de Pilar',
    categoria: 'hospital',
    categoriaText: 'Hospital / Salud',
    icono: 'hospital-building',
    color: '#E53935',
    direccion: 'Panamericana Km 52.5, Pilar',
    distancia: '2.4 km',
    tiempo: '5 min',
    coordenadasSimuladas: { top: 32, left: 62 },
  },
  {
    id: '2',
    nombre: 'Hospital F. Sanguinetti',
    categoria: 'hospital',
    categoriaText: 'Hospital',
    icono: 'medical-bag',
    color: '#E53935',
    direccion: 'Víctor Vergani 850, Pilar',
    distancia: '1.1 km',
    tiempo: '3 min',
    coordenadasSimuladas: { top: 48, left: 42 },
  },
  {
    id: '3',
    nombre: 'Comisaría Pilar 1ª',
    categoria: 'comisaria',
    categoriaText: 'Comisaría / Seguridad',
    icono: 'shield-account',
    color: '#1E88E5',
    direccion: 'Tucumán 555, Pilar Centro',
    distancia: '0.8 km',
    tiempo: '2 min',
    coordenadasSimuladas: { top: 40, left: 48 },
  },
  {
    id: '4',
    nombre: 'SUM Centro Comunitario Pilar',
    categoria: 'sum',
    categoriaText: 'SUM / Centro Vecinal',
    icono: 'account-group',
    color: '#8E24AA',
    direccion: 'San Martín 120, Pilar',
    distancia: '1.5 km',
    tiempo: '4 min',
    coordenadasSimuladas: { top: 58, left: 55 },
  },
  {
    id: '5',
    nombre: 'Parroquia Ntra. Sra. del Pilar',
    categoria: 'turismo',
    categoriaText: 'Punto Turístico',
    icono: 'church',
    color: '#FB8C00',
    direccion: 'Plaza 12 de Octubre, Pilar',
    distancia: '0.5 km',
    tiempo: '1 min',
    coordenadasSimuladas: { top: 44, left: 38 },
  },
  {
    id: '6',
    nombre: 'Supermercado Carrefour Pilar',
    categoria: 'supermercado',
    categoriaText: 'Supermercado',
    icono: 'cart',
    color: '#43A047',
    direccion: 'Av. Tratado de Pilar 300',
    distancia: '2.0 km',
    tiempo: '6 min',
    coordenadasSimuladas: { top: 25, left: 30 },
  },
];

export default function ExploreScreen() {
  const [categoriaSel, setCategoriaSel] = useState<string>('todos');
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(LUGARES_PILAR[0]);
  const [modoRuta, setModoRuta] = useState<boolean>(false);

  // Filto lugares según categoría seleccionada
  const lugaresFiltrados = categoriaSel === 'todos'
    ? LUGARES_PILAR
    : LUGARES_PILAR.filter(l => l.categoria === categoriaSel);

  return (
    <ThemedView style={styles.container}>
      <SwipeableScreen currentTab="explore">
        <SafeAreaView style={styles.safeArea} edges={['top']}>

          {/* header Superior con Búsqueda */}
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
              <Text style={styles.searchText}>Buscar en Pilar (Ej: Hospitales, SUM)...</Text>
              <TouchableOpacity style={styles.gpsButton}>
                <Ionicons name="locate" size={18} color="#2196F3" />
              </TouchableOpacity>
            </View>

            {/* carrucel de filtro  */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'todos' && styles.chipActivo]}
                onPress={() => setCategoriaSel('todos')}
              >
                <Text style={[styles.chipText, categoriaSel === 'todos' && styles.chipTextActivo]}>🗺️ Todos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'hospital' && styles.chipActivo]}
                onPress={() => setCategoriaSel('hospital')}
              >
                <Text style={[styles.chipText, categoriaSel === 'hospital' && styles.chipTextActivo]}>🏥 Hospitales</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'comisaria' && styles.chipActivo]}
                onPress={() => setCategoriaSel('comisaria')}
              >
                <Text style={[styles.chipText, categoriaSel === 'comisaria' && styles.chipTextActivo]}>👮 Comisarías</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'sum' && styles.chipActivo]}
                onPress={() => setCategoriaSel('sum')}
              >
                <Text style={[styles.chipText, categoriaSel === 'sum' && styles.chipTextActivo]}>🏛️ SUM / Salud</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'supermercado' && styles.chipActivo]}
                onPress={() => setCategoriaSel('supermercado')}
              >
                <Text style={[styles.chipText, categoriaSel === 'supermercado' && styles.chipTextActivo]}>🛒 Supermercados</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, categoriaSel === 'turismo' && styles.chipActivo]}
                onPress={() => setCategoriaSel('turismo')}
              >
                <Text style={[styles.chipText, categoriaSel === 'turismo' && styles.chipTextActivo]}>⛪ Turismo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ares de  Visual Simulado */}
          <View style={styles.mapArea}>
            <View style={styles.mapCanvas}>
              <View style={[styles.street, { top: '45%', width: '100%', height: 16 }]} />
              <View style={[styles.street, { left: '45%', height: '100%', width: 16 }]} />
              <View style={[styles.streetDiagonal, { top: '20%', left: '10%', width: '80%', height: 10 }]} />
              
              <View style={styles.riverArea}>
                <Text style={styles.riverText}>Río Luján - Pilar</Text>
              </View>

              <View style={[styles.userGpsPin, { top: '50%', left: '44%' }]}>
                <View style={styles.userPulse} />
                <Ionicons name="navigate-circle" size={32} color="#2196F3" />
              </View>

              {lugaresFiltrados.map((lugar) => {
                const esSeleccionado = lugarSeleccionado?.id === lugar.id;
                return (
                  <TouchableOpacity
                    key={lugar.id}
                    style={[
                      styles.markerPin,
                      {
                        top: `${lugar.coordenadasSimuladas.top}%`,
                        left: `${lugar.coordenadasSimuladas.left}%`,
                        backgroundColor: lugar.color,
                        transform: [{ scale: esSeleccionado ? 1.25 : 1 }],
                        zIndex: esSeleccionado ? 10 : 2,
                      },
                    ]}
                    onPress={() => {
                      setLugarSeleccionado(lugar);
                      setModoRuta(false);
                    }}
                  >
                    <MaterialCommunityIcons name={lugar.icono as any} size={18} color="#FFF" />
                  </TouchableOpacity>
                );
              })}

              {modoRuta && lugarSeleccionado && (
                <View style={styles.routeOverlay}>
                  <View style={styles.routeLine} />
                  <View style={styles.routeBanner}>
                    <Ionicons name="navigate-outline" size={20} color="#FFF" />
                    <Text style={styles.routeBannerText}>
                      En 200m gire a la derecha por Av. Tratado de Pilar
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Tarjeta Inferior con la Información del Lugar Seleccionado */}
          {lugarSeleccionado && (
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.badgeCategory, { backgroundColor: lugarSeleccionado.color + '22' }]}>
                    <Text style={[styles.badgeText, { color: lugarSeleccionado.color }]}>
                      {lugarSeleccionado.categoriaText}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{lugarSeleccionado.nombre}</Text>
                  <Text style={styles.cardAddress}>📍 {lugarSeleccionado.direccion}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeCardButton}
                  onPress={() => setLugarSeleccionado(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Ionicons name="map-outline" size={18} color="#2196F3" />
                  <Text style={styles.metricValue}>{lugarSeleccionado.distancia}</Text>
                  <Text style={styles.metricLabel}>Distancia</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Ionicons name="time-outline" size={18} color="#2196F3" />
                  <Text style={styles.metricValue}>{lugarSeleccionado.tiempo}</Text>
                  <Text style={styles.metricLabel}>Tiempo est.</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Ionicons name="car-outline" size={18} color="#2196F3" />
                  <Text style={styles.metricValue}>Auto / Colectivo</Text>
                  <Text style={styles.metricLabel}>Transporte</Text>
                </View>
              </View>

              <View style={styles.actionButtonsRow}>
                {!modoRuta ? (
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => setModoRuta(true)}
                  >
                    <Ionicons name="navigate" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnPrimaryText}>Trazar Ruta</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.btnSuccess}
                    onPress={() => alert('¡Navegación GPS Iniciada para la Expo!')}
                  >
                    <Ionicons name="play-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnPrimaryText}>Iniciar Navegación</Text>
                  </TouchableOpacity>
                )}

                {modoRuta && (
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => setModoRuta(false)}
                  >
                    <Text style={styles.btnSecondaryText}>Cancelar Ruta</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 3,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchText: {
    flex: 1,
    color: '#718096',
    fontSize: 14,
  },
  gpsButton: {
    padding: 4,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  filtrosContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActivo: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  chipTextActivo: {
    color: '#FFFFFF',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E6EEF4',
  },
  street: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  streetDiagonal: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-25deg' }],
  },
  riverArea: {
    position: 'absolute',
    top: '10%',
    right: '5%',
    width: 140,
    height: 80,
    backgroundColor: '#BEE3F8',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  riverText: {
    fontSize: 10,
    color: '#2B6CB0',
    fontWeight: 'bold',
  },
  userGpsPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  userPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
  },
  markerPin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  routeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  routeLine: {
    position: 'absolute',
    top: '44%',
    left: '46%',
    width: 120,
    height: 4,
    backgroundColor: '#2196F3',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 2,
  },
  routeBanner: {
    marginTop: 16,
    backgroundColor: '#2D3748',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  routeBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  cardAddress: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  closeCardButton: {
    padding: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnSuccess: {
    flex: 1,
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnSecondary: {
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnSecondaryText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
});