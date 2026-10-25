import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/src/components/themed-view';

// Componentes del mapa y navegación
import LeafletMap from '@/src/components/leaflet-map';
import { SwipeableScreen } from '@/src/components/swipeable-screen';
import { AppHeader } from '@/src/components/app-header';

// Hooks y tipos de datos
import { useMaps } from '@/src/hooks/useMaps';
import { PlaceCategory } from '../servicios/map/type';

export default function ExploreScreen() {
  // ============================================================
  // Estados para categoría, modo de navegación y búsqueda interactiva
  // ============================================================
  const [categoriaSel, setCategoriaSel] = useState<PlaceCategory>('all');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showNavAlert, setShowNavAlert] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  // ============================================================

  // ============================================================
  // Consumo del Hook useMaps con todas las funciones de ubicación, rutas y búsqueda
  // ============================================================
  const {
    userLocation,
    places,
    selectedPlace,
    routeData,
    loading,
    errorMsg,
    transportMode,
    loadPlaces,
    searchPlaces,
    calculateRouteTo,
    changeTransportMode,
    clearSelection,
  } = useMaps();
  // ============================================================

  // ============================================================
  // Función para filtrar lugares cuando el usuario toca un cuadro de categoría
  // ============================================================
  const handleFiltro = (cat: PlaceCategory) => {
    setCategoriaSel(cat);
    loadPlaces(cat);
  };
  // ============================================================

  // ============================================================
  // Función para ejecutar la búsqueda por texto libre con Nominatim
  // ============================================================
  const handleBuscar = () => {
    if (textoBusqueda.trim()) {
      searchPlaces(textoBusqueda);
    }
  };
  // ============================================================

  // ============================================================
  // Función al tocar un marcador en el mapa para trazar la ruta hacia ese lugar
  // ============================================================
  const handleMarkerPress = (placeId: string) => {
    const place = places.find((p) => p.id === placeId);
    if (place) {
      calculateRouteTo(place);
    }
  };
  // ============================================================

  // ============================================================
  // Función para iniciar navegación, ocultar otros lugares y programar aviso de 10 seg
  // ============================================================
  const iniciarNavegacion = () => {
    setIsNavigating(true);
    setShowNavAlert(true);

    setTimeout(() => {
      setShowNavAlert(false);
    }, 10000);
  };
  // ============================================================

  return (
    <ThemedView style={styles.container}>
      <SwipeableScreen currentTab="mapa">
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <AppHeader />

        {/* HEADER Y FILTROS */}
        <View style={styles.header}>
          
          {/* ============================================================ */}
          {/* Barra interactiva: TextInput con búsqueda por texto y botón para limpiar */}
          {/* ============================================================ */}
          <View style={styles.searchBar}>
            <TouchableOpacity onPress={handleBuscar}>
              <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
            </TouchableOpacity>

            <TextInput
              style={{ flex: 1, color: '#1A202C', fontSize: 14, paddingVertical: 0 }}
              placeholder="Buscar en Pilar... (ej: farmacia, museo)"
              placeholderTextColor="#718096"
              value={textoBusqueda}
              onChangeText={setTextoBusqueda}
              onSubmitEditing={handleBuscar}
              returnKeyType="search" 
            />

            {textoBusqueda.length > 0 && (
              <TouchableOpacity onPress={() => { setTextoBusqueda(''); loadPlaces('all'); }}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}

            {loading && <ActivityIndicator size="small" color="#2196F3" style={{ marginLeft: 6 }} />}
          </View>
          {/* ============================================================ */}

          {/* ============================================================ */}
          {/* Carrusel horizontal de botones para filtrar por categoría */}
          {/* ============================================================ */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosContainer}>
            <TouchableOpacity style={[styles.chip, categoriaSel === 'all' && styles.chipActivo]} onPress={() => handleFiltro('all')}>
              <Text style={[styles.chipText, categoriaSel === 'all' && styles.chipTextActivo]}>🗺️ Todos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, categoriaSel === 'hospital' && styles.chipActivo]} onPress={() => handleFiltro('hospital')}>
              <Text style={[styles.chipText, categoriaSel === 'hospital' && styles.chipTextActivo]}>🏥 Hospitales</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, categoriaSel === 'police' && styles.chipActivo]} onPress={() => handleFiltro('police')}>
              <Text style={[styles.chipText, categoriaSel === 'police' && styles.chipTextActivo]}>👮 Comisarías</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, categoriaSel === 'supermarket' && styles.chipActivo]} onPress={() => handleFiltro('supermarket')}>
              <Text style={[styles.chipText, categoriaSel === 'supermarket' && styles.chipTextActivo]}>🛒 Supermercados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, categoriaSel === 'restaurant' && styles.chipActivo]} onPress={() => handleFiltro('restaurant')}>
              <Text style={[styles.chipText, categoriaSel === 'restaurant' && styles.chipTextActivo]}>🍽️ Restaurantes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.chip, categoriaSel === 'park' && styles.chipActivo]} onPress={() => handleFiltro('park')}>
              <Text style={[styles.chipText, categoriaSel === 'park' && styles.chipTextActivo]}>🌳 Parques</Text>
            </TouchableOpacity>
          </ScrollView>
          {/* ============================================================ */}
        </View>

        {/* ============================================================ */}
        {/* MAPA LEAFLET: Durante navegación solo muestra el destino seleccionado */}
        {/* ============================================================ */}
        <View style={styles.mapArea}>
          {errorMsg ? (
            <View style={styles.centeredMsg}>
              <Ionicons name="warning-outline" size={48} color="#E53935" />
              <Text style={{ color: '#E53935', textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{errorMsg}</Text>
              <Text style={{ textAlign: 'center', paddingHorizontal: 20, marginTop: 8, color: '#666' }}>
                Ve a Configuración → Aplicaciones → Expo Go → Permisos → Ubicación → Permitir.
              </Text>
            </View>
          ) : userLocation ? (
            <LeafletMap
              userLocation={userLocation}
              places={isNavigating && selectedPlace ? [selectedPlace] : places}
              selectedPlace={selectedPlace}
              routeData={routeData}
              onMarkerPress={handleMarkerPress}
            />
          ) : (
            <View style={styles.centeredMsg}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{ marginTop: 10, color: '#666' }}>Buscando satélites GPS...</Text>
            </View>
          )}
        </View>
        {/* ============================================================ */}

        {/* ============================================================ */}
        {/* TARJETA DE INFORMACIÓN: Se oculta automáticamente cuando isNavigating es true */}
        {/* ============================================================ */}
        {selectedPlace && !isNavigating && (
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
                <Text style={styles.cardAddress} numberOfLines={2}>📍 {selectedPlace.address}</Text>
              </View>
              <TouchableOpacity style={styles.closeCardButton} onPress={clearSelection}>
                <Ionicons name="close-circle" size={26} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Selector de modo de transporte (Auto, A pie, Bici) */}
            <View style={styles.transportSelector}>
              <TouchableOpacity style={[styles.transportBtn, transportMode === 'driving' && styles.transportBtnActive]} onPress={() => changeTransportMode('driving')}>
                <Ionicons name="car-outline" size={18} color={transportMode === 'driving' ? '#FFF' : '#666'} />
                <Text style={[styles.transportBtnText, transportMode === 'driving' && styles.transportBtnTextActive]}>Auto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.transportBtn, transportMode === 'foot' && styles.transportBtnActive]} onPress={() => changeTransportMode('foot')}>
                <Ionicons name="walk-outline" size={18} color={transportMode === 'foot' ? '#FFF' : '#666'} />
                <Text style={[styles.transportBtnText, transportMode === 'foot' && styles.transportBtnTextActive]}>A pie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.transportBtn, transportMode === 'bike' && styles.transportBtnActive]} onPress={() => changeTransportMode('bike')}>
                <Ionicons name="bicycle-outline" size={18} color={transportMode === 'bike' ? '#FFF' : '#666'} />
                <Text style={[styles.transportBtnText, transportMode === 'bike' && styles.transportBtnTextActive]}>Bici</Text>
              </TouchableOpacity>
            </View>

            {/* Métricas de ruta calculadas (Distancia y Tiempo estimado) */}
            {routeData ? (
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Ionicons name="map-outline" size={18} color="#2196F3" />
                  <Text style={styles.metricValue}>{routeData.distanceKm} km</Text>
                  <Text style={styles.metricLabel}>Distancia</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Ionicons name="time-outline" size={18} color="#2196F3" />
                  <Text style={styles.metricValue}>{routeData.durationMin} min</Text>
                  <Text style={styles.metricLabel}>Tiempo est.</Text>
                </View>
              </View>
            ) : (
              <View style={styles.metricsRow}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={{ marginLeft: 10, color: '#A0AEC0' }}>Calculando ruta...</Text>
              </View>
            )}

            {/* Botón para activar el modo navegación */}
            <TouchableOpacity
              style={styles.btnSuccess}
              onPress={iniciarNavegacion}
            >
              <Ionicons name="navigate" size={20} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.btnPrimaryText}>Iniciar Navegación</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* ============================================================ */}
        
        {/* ============================================================ */}
        {/* Botón flotante para finalizar navegación y restaurar los lugares */}
        {/* ============================================================ */}
        {isNavigating && (
          <TouchableOpacity
            style={styles.btnSalirNav}
            onPress={() => {
              setIsNavigating(false);
              clearSelection();
            }}
          >
            <Ionicons name="stop-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Finalizar Navegación</Text>
          </TouchableOpacity>
        )}
        {/* ============================================================ */}

        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}

// ============================================================
// Estilos del componente Mapa y de sus elementos flotantes
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#FFFFFF', elevation: 3, zIndex: 10,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
  },
  searchText: { flex: 1, color: '#718096', fontSize: 14 },
  filtrosContainer: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    backgroundColor: '#EDF2F7', borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActivo: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  chipTextActivo: { color: '#FFFFFF' },
  mapArea: { flex: 1 },
  centeredMsg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  cardAddress: { fontSize: 13, color: '#718096', marginTop: 2 },
  closeCardButton: { padding: 2 },
  metricsRow: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: '#F7FAFC', borderRadius: 14, paddingVertical: 12,
    marginVertical: 14, borderWidth: 1, borderColor: '#EDF2F7',
  },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: 'bold', color: '#2D3748', marginTop: 2 },
  metricLabel: { fontSize: 11, color: '#A0AEC0' },
  metricDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0' },
  btnSuccess: {
    backgroundColor: '#388E3C', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 2,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  transportSelector: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#EDF2F7', 
    borderRadius: 12, padding: 4, marginVertical: 10
  },
  transportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 8,
  },
  transportBtnActive: {
    backgroundColor: '#2196F3', elevation: 2,
  },
  transportBtnText: {
    fontSize: 13, fontWeight: '600', color: '#666', marginLeft: 6
  },
  transportBtnTextActive: {
    color: '#FFF'
  },
  btnSalirNav: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
});
// ============================================================
