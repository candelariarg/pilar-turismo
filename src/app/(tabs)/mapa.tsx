import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/src/components/themed-view';

// Componentes del mapa y navegación
import LeafletMap from '@/src/components/leaflet-map';
import { SwipeableScreen } from '@/src/components/swipeable-screen';
import { AppHeader } from '@/src/components/app-header';

// Hooks y tipos de datos
import { useMaps } from '@/src/hooks/useMaps';
import { PlaceCategory } from '@/src/servicios/map/type';

export default function ExploreScreen() {
  const { t } = useTranslation();

  // ============================================================
  // Estados para categoría, modo de navegación y búsqueda interactiva
  // ============================================================
  const [categoriaSel, setCategoriaSel] = useState<PlaceCategory | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showNavAlert, setShowNavAlert] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [centrarEnUsuario, setCentrarEnUsuario] = useState(0); // contador para disparar re-center
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
    clearPlaces,
  } = useMaps();
  // ============================================================

  // ============================================================
  // Función para filtrar lugares cuando el usuario toca un cuadro de categoría
  // Si vuelve a tocar la misma categoría, se deselecciona y se limpian los pines del mapa
  // ============================================================
  const handleFiltro = (cat: PlaceCategory) => {
    if (categoriaSel === cat) {
      setCategoriaSel(null);
      clearPlaces();
    } else {
      setCategoriaSel(cat);
      loadPlaces(cat);
    }
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
  // Función  iniciar navegación, ocultar otros lugares 
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

          {/* ============================================================ */}
          {/* Área del mapa: ocupa todo el espacio restante */}
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
                places={isNavigating ? [] : places}
                selectedPlace={selectedPlace}
                routeData={routeData}
                onMarkerPress={handleMarkerPress}
                centerOnUser={centrarEnUsuario}
              />
            ) : (
              <View style={styles.centeredMsg}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#666' }}>{t('map.searchingGps')}</Text>
              </View>
            )}

            {/* ============================================================ */}
            {/* Barra flotante de búsqueda y filtros (sólo visible fuera de navegación) */}
            {/* ============================================================ */}
            {!isNavigating && (
              <View style={styles.floatingSearchWrapper}>
                <View style={styles.floatingSearchBar}>
                  <TouchableOpacity onPress={handleBuscar}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                  </TouchableOpacity>

                  <TextInput
                    style={{ flex: 1, color: '#1A202C', fontSize: 14, paddingVertical: 0 }}
                    placeholder={t('map.searchPlaceholder')}
                    placeholderTextColor="#718096"
                    value={textoBusqueda}
                    onChangeText={setTextoBusqueda}
                    onSubmitEditing={handleBuscar}
                    returnKeyType="search"
                  />

                  {textoBusqueda.length > 0 && (
                    <TouchableOpacity onPress={() => {
                      setTextoBusqueda('');
                      if (categoriaSel) {
                        loadPlaces(categoriaSel);
                      } else {
                        clearPlaces();
                      }
                    }}>
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  )}

                  {loading && <ActivityIndicator size="small" color="#2196F3" style={{ marginLeft: 6 }} />}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtrosContainer}
                  contentContainerStyle={{ paddingHorizontal: 2 }}
                >
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'all' && styles.chipActivo]} onPress={() => handleFiltro('all')}>
                    <Text style={[styles.chipText, categoriaSel === 'all' && styles.chipTextActivo]}>🗺️ {t('map.categories.all')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'hospital' && styles.chipActivo]} onPress={() => handleFiltro('hospital')}>
                    <Text style={[styles.chipText, categoriaSel === 'hospital' && styles.chipTextActivo]}>🏥 {t('map.categories.hospital')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'police' && styles.chipActivo]} onPress={() => handleFiltro('police')}>
                    <Text style={[styles.chipText, categoriaSel === 'police' && styles.chipTextActivo]}>👮 {t('map.categories.police')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'supermarket' && styles.chipActivo]} onPress={() => handleFiltro('supermarket')}>
                    <Text style={[styles.chipText, categoriaSel === 'supermarket' && styles.chipTextActivo]}>🛒 {t('map.categories.supermarket')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'restaurant' && styles.chipActivo]} onPress={() => handleFiltro('restaurant')}>
                    <Text style={[styles.chipText, categoriaSel === 'restaurant' && styles.chipTextActivo]}>🍽️ {t('map.categories.restaurant')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, categoriaSel === 'park' && styles.chipActivo]} onPress={() => handleFiltro('park')}>
                    <Text style={[styles.chipText, categoriaSel === 'park' && styles.chipTextActivo]}>🌳 {t('map.categories.park')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
            {/* ============================================================ */}

            {/* ============================================================ */}
            {/* Botón flotante circular "Mi Ubicación" (estilo Google Maps) */}
            {/* Ubicado por encima del botón de la IA y adaptado a la tarjeta inferior */}
            {/* ============================================================ */}
            {!isNavigating && (
              <TouchableOpacity
                style={[
                  styles.btnMiUbicacion,
                  selectedPlace && { bottom: 275 }
                ]}
                onPress={() => setCentrarEnUsuario(n => n + 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="locate" size={22} color="#2196F3" />
              </TouchableOpacity>
            )}
            {/* ============================================================ */}

          </View>
          {/* ============================================================ */}

          {/* ============================================================ */}
          {/* TARJETA INFERIOR estilo Material Design / Google Maps Bottom Sheet */}
          {/* Se oculta automáticamente cuando inicia la navegación */}
          {/* ============================================================ */}
          {selectedPlace && !isNavigating && (
            <View style={styles.cardInfo}>

              {/* Barrita de arrastre (drag handle) estilo Material Design */}
              <View style={styles.dragHandle} />

              {/* Cabecera: nombre del lugar y botón de cierre */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
                  <Text style={styles.cardAddress} numberOfLines={2}>📍 {selectedPlace.address}</Text>
                </View>
                <TouchableOpacity style={styles.closeCardButton} onPress={clearSelection}>
                  <Ionicons name="close-circle" size={26} color="#BDBDBD" />
                </TouchableOpacity>
              </View>

              {/* ============================================================ */}
              {/* Selector de transporte rediseñado: icono + etiqueta + tiempo estimado */}
              {/* ============================================================ */}
              <View style={styles.transportSelector}>
                <TouchableOpacity
                  style={[styles.transportBtn, transportMode === 'driving' && styles.transportBtnActive]}
                  onPress={() => changeTransportMode('driving')}
                >
                  <Ionicons name="car" size={20} color={transportMode === 'driving' ? '#1A73E8' : '#9E9E9E'} />
                  <Text style={[styles.transportBtnText, transportMode === 'driving' && styles.transportBtnTextActive]}>
                    {t('map.transport.car')}
                  </Text>
                  {routeData && transportMode === 'driving' && (
                    <Text style={styles.transportBtnTime}>{routeData.durationMin} min</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.transportBtn, transportMode === 'foot' && styles.transportBtnActive]}
                  onPress={() => changeTransportMode('foot')}
                >
                  <Ionicons name="walk" size={20} color={transportMode === 'foot' ? '#1A73E8' : '#9E9E9E'} />
                  <Text style={[styles.transportBtnText, transportMode === 'foot' && styles.transportBtnTextActive]}>
                    {t('map.transport.walk')}
                  </Text>
                  {routeData && transportMode === 'foot' && (
                    <Text style={styles.transportBtnTime}>{routeData.durationMin} min</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.transportBtn, transportMode === 'bike' && styles.transportBtnActive]}
                  onPress={() => changeTransportMode('bike')}
                >
                  <Ionicons name="bicycle" size={20} color={transportMode === 'bike' ? '#1A73E8' : '#9E9E9E'} />
                  <Text style={[styles.transportBtnText, transportMode === 'bike' && styles.transportBtnTextActive]}>
                    {t('map.transport.bike')}
                  </Text>
                  {routeData && transportMode === 'bike' && (
                    <Text style={styles.transportBtnTime}>{routeData.durationMin} min</Text>
                  )}
                </TouchableOpacity>
              </View>
              {/* ============================================================ */}

              {/* Métricas: distancia y tiempo en grande */}
              {routeData ? (
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricBigValue}>{routeData.distanceKm} km</Text>
                    <Text style={styles.metricLabel}>{t('map.distance')}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricBigValue}>{routeData.durationMin} min</Text>
                    <Text style={styles.metricLabel}>{t('map.estimatedTime')}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.metricsRow}>
                  <ActivityIndicator size="small" color="#1A73E8" />
                  <Text style={{ marginLeft: 10, color: '#A0AEC0' }}>{t('map.calculatingRoute')}</Text>
                </View>
              )}

              {/* Botón Google azul (#1A73E8) con sombra de elevación */}
              <TouchableOpacity
                style={styles.btnNavegar}
                onPress={iniciarNavegacion}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>{t('map.startNavigation')}</Text>
              </TouchableOpacity>

            </View>
          )}
          {/* ============================================================ */}

          {/* ============================================================ */}
          {/* Botón para finalizar navegación y restaurar los lugares */}
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
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('map.endNavigation')}</Text>
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
  mapArea: { flex: 1, position: 'relative' },
  centeredMsg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  // ============================================================
  // Estilos de la barra flotante de búsqueda y filtros
  // ============================================================
  floatingSearchWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 50,
  },
  floatingSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 8,
  },
  filtrosContainer: { flexDirection: 'row' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  chipActivo: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  chipTextActivo: { color: '#FFFFFF' },
  // ============================================================

  // ============================================================
  // Botón circular flotante "Mi Ubicación" (estilo Google Maps)
  // Ubicado a la derecha, por encima del botón flotante de la IA
  // ============================================================
  btnMiUbicacion: {
    position: 'absolute',
    bottom: 96,
    right: 28,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 50,
  },
  // ============================================================

  // ============================================================
  // Bottom Sheet estilo Material Design / Google Maps
  // ============================================================
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#202124', letterSpacing: 0.1 },
  cardAddress: { fontSize: 13, color: '#5F6368', marginTop: 3, lineHeight: 18 },
  closeCardButton: { padding: 2, marginLeft: 8 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  metricItem: { alignItems: 'center' },
  metricBigValue: { fontSize: 22, fontWeight: '700', color: '#1A73E8' },
  metricValue: { fontSize: 14, fontWeight: 'bold', color: '#2D3748', marginTop: 2 },
  metricLabel: { fontSize: 11, color: '#9E9E9E', marginTop: 2 },
  metricDivider: { width: 1, height: 32, backgroundColor: '#E0E0E0' },
  // ============================================================

  // ============================================================
  // Selector de transporte rediseñado: fondo sutil, botón activo azul Google
  // ============================================================
  transportSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 2,
  },
  transportBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 2,
  },
  transportBtnActive: {
    backgroundColor: '#E8F0FE',
    elevation: 0,
  },
  transportBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    marginTop: 2,
  },
  transportBtnTextActive: { color: '#1A73E8' },
  transportBtnTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A73E8',
    backgroundColor: '#C5D9FB',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
    overflow: 'hidden',
  },
  // ============================================================

  // ============================================================
  // Botón de navegación azul Google (#1A73E8) con elevación y sombra
  // ============================================================
  btnNavegar: {
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnSuccess: {
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  // ============================================================
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
