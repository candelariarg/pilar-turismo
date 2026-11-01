import React, { useRef, useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/src/components/themed-view';

// Componentes del mapa y navegación
import LeafletMap from '@/src/components/leaflet-map';
import { SwipeableScreen } from '@/src/components/swipeable-screen';

// Hooks y tipos de datos
import { useMaps } from '@/src/hooks/useMaps';
import { PlaceCategory } from '@/src/servicios/map/type';

export default function ExploreScreen() {
  const { t } = useTranslation();

  // Parámetros recibidos desde otras pantallas
  const params = useLocalSearchParams() as {
    nombre?: string;
    direccion?: string;
    lat?: string;
    lon?: string;
  };
  const lastProcessedParamRef = useRef<string | null>(null);

  // ============================================================
  // Estados para categoría, modo de navegación y búsqueda interactiva
  // ============================================================
  const [categoriaSel, setCategoriaSel] = useState<PlaceCategory | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [centrarEnUsuario, setCentrarEnUsuario] = useState(0); // contador para disparar re-center
  const [cardHeight, setCardHeight] = useState(0);

  // Animación slide-up del bottom sheet (estilo Google Maps)
  const slideAnim = useRef(new Animated.Value(400)).current;
  // ============================================================

  // ============================================================
  // Consumo del Hook useMaps con todas las funciones de ubicación, rutas y búsqueda
  // ============================================================
  const {
    userLocation,
    places,
    selectedPlace,
    setSelectedPlace,
    routeData,
    setRouteData,
    loading,
    errorMsg,
    transportMode,
    loadPlaces,
    searchPlaces,
    calculateRouteTo,
    changeTransportMode,
    clearSelection,
    clearPlaces,
    focusOnPlace,
  } = useMaps();
  // ============================================================

  // ============================================================
  // Animación de entrada/salida del bottom sheet al aparecer/desaparecer selectedPlace
  // ============================================================
  useEffect(() => {
    if (selectedPlace) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setCardHeight(0));
    }
  }, [selectedPlace]);
  // ============================================================

  // ============================================================
  // Si llegamos a la pantalla del mapa con un lugar específico desde Inicio,
  // lo marcamos, lo enfocamos y trazamos la ruta hacia él
  // ============================================================
  useEffect(() => {
    const hasTarget = Boolean(params.nombre || params.direccion || params.lat);
    if (!hasTarget) return;

    const paramKey = `${params.nombre ?? ''}|${params.direccion ?? ''}|${params.lat ?? ''}|${params.lon ?? ''}`;
    if (lastProcessedParamRef.current === paramKey && selectedPlace) return;
    lastProcessedParamRef.current = paramKey;

    if (params.nombre) {
      setTextoBusqueda(params.nombre);
    } else if (params.direccion) {
      setTextoBusqueda(params.direccion);
    }

    const latNum = params.lat ? parseFloat(params.lat) : undefined;
    const lonNum = params.lon ? parseFloat(params.lon) : undefined;

    focusOnPlace(params.nombre, params.direccion, latNum, lonNum);
  }, [params.nombre, params.direccion, params.lat, params.lon, userLocation]);
  // ============================================================

  // ============================================================
  // Función para filtrar lugares cuando el usuario toca un cuadro de categoría
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
      setSelectedPlace(place);
      setRouteData(null);
    }
  };
  // ============================================================

  // ============================================================
  // Función iniciar navegación
  // ============================================================
  const iniciarNavegacion = () => {
    setIsNavigating(true);
  };

  const salirNavegacion = () => {
    setIsNavigating(false);
    clearSelection();
  };
  // ============================================================

  return (
    <ThemedView style={styles.container}>
      <SwipeableScreen currentTab="mapa">
        <SafeAreaView style={styles.safeArea} edges={['top']}>

          {/* ============================================================ */}
          {/* Área del mapa a pantalla completa estilo Google Maps */}
          {/* ============================================================ */}
          <View style={styles.mapArea}>
            {errorMsg ? (
              <View style={styles.centeredMsg}>
                <Ionicons name="warning-outline" size={48} color="#E53935" />
                <Text style={{ color: '#E53935', textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{errorMsg}</Text>
                <Text style={{ textAlign: 'center', paddingHorizontal: 20, marginTop: 8, color: '#666' }}>
                  {t('map.gpsPermissionHelp')}
                </Text>
              </View>
            ) : userLocation ? (
              <LeafletMap
                userLocation={userLocation}
                places={isNavigating ? (selectedPlace ? [selectedPlace] : []) : places}
                selectedPlace={selectedPlace}
                routeData={routeData}
                onMarkerPress={handleMarkerPress}
                centerOnUser={centrarEnUsuario}
              />
            ) : (
              <View style={styles.centeredMsg}>
                <ActivityIndicator size="large" color="#1A73E8" />
                <Text style={{ marginTop: 10, color: '#5F6368', fontWeight: '500' }}>{t('map.searchingGps')}</Text>
              </View>
            )}

            {/* ============================================================ */}
            {/* Modo Navegación: Panel superior activo estilo Google Maps */}
            {/* ============================================================ */}
            {isNavigating && selectedPlace && (
              <View style={styles.navTopBar}>
                <View style={styles.navTopIconContainer}>
                  <Ionicons name="navigate" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.navTopTitle} numberOfLines={1}>
                    {t('map.enRouteTo', { name: selectedPlace.name })}
                  </Text>
                  <Text style={styles.navTopSubtitle} numberOfLines={1}>
                    {routeData ? `${routeData.distanceKm} km • ${routeData.durationMin} ${t('map.estimatedMin')}` : selectedPlace.address}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.navTopCloseBtn}
                  onPress={salirNavegacion}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            {/* ============================================================ */}

            {/* ============================================================ */}
            {/* Barra flotante de búsqueda y filtros alineada pixel-perfect */}
            {/* ============================================================ */}
            {!isNavigating && (
              <View style={styles.floatingSearchWrapper}>
                <View style={styles.floatingSearchBar}>
                  {/* Logo sutil PaseAR como ícono de app */}
                  <Image
                    source={require('@/assets/images/logos/logoapp.png')}
                    style={styles.appLogoMini}
                    resizeMode="contain"
                  />

                  <TextInput
                    style={styles.searchInput}
                    placeholder={t('map.searchPlaceholderPasear')}
                    placeholderTextColor="#70757A"
                    value={textoBusqueda}
                    onChangeText={setTextoBusqueda}
                    onSubmitEditing={handleBuscar}
                    returnKeyType="search"
                  />

                  {textoBusqueda.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setTextoBusqueda('');
                        if (categoriaSel) {
                          loadPlaces(categoriaSel);
                        } else {
                          clearPlaces();
                        }
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close-circle" size={18} color="#9AA0A6" />
                    </TouchableOpacity>
                  )}

                  {loading ? (
                    <ActivityIndicator size="small" color="#1A73E8" style={{ marginLeft: 6 }} />
                  ) : (
                    <TouchableOpacity onPress={handleBuscar} style={{ padding: 4 }}>
                      <Ionicons name="search" size={20} color="#1A73E8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/*  categorías con íconos vectoriales delgados */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtrosContainer}
                  contentContainerStyle={styles.filtrosContent}
                >
                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'all' && styles.chipActivo]}
                    onPress={() => handleFiltro('all')}
                  >
                    <Ionicons
                      name="compass-outline"
                      size={15}
                      color={categoriaSel === 'all' ? '#FFFFFF' : '#1A73E8'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'all' && styles.chipTextActivo]}>
                      {t('map.categories.all')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'hospital' && styles.chipActivo]}
                    onPress={() => handleFiltro('hospital')}
                  >
                    <Ionicons
                      name="medkit-outline"
                      size={15}
                      color={categoriaSel === 'hospital' ? '#FFFFFF' : '#E53935'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'hospital' && styles.chipTextActivo]}>
                      {t('map.categories.hospital')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'police' && styles.chipActivo]}
                    onPress={() => handleFiltro('police')}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={15}
                      color={categoriaSel === 'police' ? '#FFFFFF' : '#1E88E5'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'police' && styles.chipTextActivo]}>
                      {t('map.categories.police')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'supermarket' && styles.chipActivo]}
                    onPress={() => handleFiltro('supermarket')}
                  >
                    <Ionicons
                      name="cart-outline"
                      size={15}
                      color={categoriaSel === 'supermarket' ? '#FFFFFF' : '#43A047'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'supermarket' && styles.chipTextActivo]}>
                      {t('map.categories.supermarket')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'restaurant' && styles.chipActivo]}
                    onPress={() => handleFiltro('restaurant')}
                  >
                    <Ionicons
                      name="restaurant-outline"
                      size={15}
                      color={categoriaSel === 'restaurant' ? '#FFFFFF' : '#FB8C00'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'restaurant' && styles.chipTextActivo]}>
                      {t('map.categories.restaurant')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.chip, categoriaSel === 'park' && styles.chipActivo]}
                    onPress={() => handleFiltro('park')}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={15}
                      color={categoriaSel === 'park' ? '#FFFFFF' : '#4CAF50'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, categoriaSel === 'park' && styles.chipTextActivo]}>
                      {t('map.categories.park')}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
            {/* ============================================================ */}

            {/* ============================================================ */}
            {/* Botón flotante circular "Mi Ubicación" */}
            {/* Posicionado a 175px (o sobre la tarjeta) para no solapar el botón de IA */}
            {/* ============================================================ */}
            {!isNavigating && (
              <TouchableOpacity
                style={[
                  styles.btnMiUbicacion,
                  selectedPlace && { bottom: cardHeight > 0 ? cardHeight + 16 : 340 }
                ]}
                onPress={() => setCentrarEnUsuario(n => n + 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="locate" size={22} color="#1A73E8" />
              </TouchableOpacity>
            )}
            {/* ============================================================ */}

          </View>
          {/* ============================================================ */}

          {/* ============================================================ */}
          {/* TARJETA INFERIOR estilo Google Maps Bottom Sheet */}
          {/* ============================================================ */}
          {selectedPlace && !isNavigating && (
            <Animated.View
              style={[
                styles.cardInfo,
                { transform: [{ translateY: slideAnim }] },
              ]}
              onLayout={(e: any) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0) setCardHeight(h);
              }}
            >
              {/* Barrita de arrastre sutil estilo Material Design */}
              <View style={styles.dragHandle} />

              {/* Cabecera: nombre del lugar y botón de cierre moderno */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
                  <View style={styles.addressRow}>
                    <Ionicons name="location-sharp" size={14} color="#EA4335" style={{ marginRight: 4, marginTop: 2 }} />
                    <Text style={styles.cardAddress} numberOfLines={2}>{selectedPlace.address}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeCardButton}
                  onPress={clearSelection}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#5F6368" />
                </TouchableOpacity>
              </View>

              {!routeData ? (
                /* Botón destacado: Cómo llegar (calcula la ruta manualmente) */
                <TouchableOpacity
                  style={[styles.btnNavegar, { marginTop: 14 }]}
                  onPress={() => calculateRouteTo(selectedPlace, transportMode)}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.btnPrimaryText}>{t('map.calculatingRoute')}</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="navigate" size={19} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.btnPrimaryText}>{t('map.placeDetails.getDirections')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  {/* Selector de modo de transporte */}
                  <View style={styles.transportSelector}>
                    <TouchableOpacity
                      style={[styles.transportBtn, transportMode === 'driving' && styles.transportBtnActive]}
                      onPress={() => changeTransportMode('driving')}
                    >
                      <Ionicons name="car" size={19} color={transportMode === 'driving' ? '#1A73E8' : '#70757A'} />
                      <Text style={[styles.transportBtnText, transportMode === 'driving' && styles.transportBtnTextActive]}>
                        {t('map.transport.car')}
                      </Text>
                      {transportMode === 'driving' && (
                        <Text style={styles.transportBtnTime}>{routeData.durationMin} {t('map.min')}</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.transportBtn, transportMode === 'foot' && styles.transportBtnActive]}
                      onPress={() => changeTransportMode('foot')}
                    >
                      <Ionicons name="walk" size={19} color={transportMode === 'foot' ? '#1A73E8' : '#70757A'} />
                      <Text style={[styles.transportBtnText, transportMode === 'foot' && styles.transportBtnTextActive]}>
                        {t('map.transport.walk')}
                      </Text>
                      {transportMode === 'foot' && (
                        <Text style={styles.transportBtnTime}>{routeData.durationMin} {t('map.min')}</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.transportBtn, transportMode === 'bike' && styles.transportBtnActive]}
                      onPress={() => changeTransportMode('bike')}
                    >
                      <Ionicons name="bicycle" size={19} color={transportMode === 'bike' ? '#1A73E8' : '#70757A'} />
                      <Text style={[styles.transportBtnText, transportMode === 'bike' && styles.transportBtnTextActive]}>
                        {t('map.transport.bike')}
                      </Text>
                      {transportMode === 'bike' && (
                        <Text style={styles.transportBtnTime}>{routeData.durationMin} {t('map.min')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Métricas estimadas de distancia y tiempo */}
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

                  {/* Botón Iniciar Navegación estilo Google Maps */}
                  <TouchableOpacity
                    style={styles.btnNavegar}
                    onPress={iniciarNavegacion}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="navigate" size={19} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnPrimaryText}>{t('map.startNavigation')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          )}
          {/* ============================================================ */}

          {/* ============================================================ */}
          {/* Botón flotante para finalizar navegación */}
          {/* ============================================================ */}
          {isNavigating && (
            <TouchableOpacity
              style={styles.btnSalirNav}
              onPress={salirNavegacion}
              activeOpacity={0.85}
            >
              <Ionicons name="close-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>{t('map.endNavigation')}</Text>
            </TouchableOpacity>
          )}
          {/* ============================================================ */}

        </SafeAreaView>
      </SwipeableScreen>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  mapArea: { flex: 1, position: 'relative' },
  centeredMsg: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  // ============================================================
  // Modo Navegación: Barra superior verde esmeralda estilo Google Maps
  // ============================================================
  navTopBar: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    backgroundColor: '#0F9D58', // Verde Google Maps navegación
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 60,
  },
  navTopIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTopTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  navTopSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  navTopCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // ============================================================
  // Barra flotante de búsqueda y filtros alineada
  // ============================================================
  floatingSearchWrapper: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  appLogoMini: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#202124',
    fontSize: 15,
    paddingVertical: 0,
  },
  filtrosContainer: {
    flexDirection: 'row',
  },
  filtrosContent: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  chipActivo: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3C4043',
  },
  chipTextActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ============================================================
  // Botón circular flotante "Mi Ubicación"
  // Separado verticalmente para no superponerse con el FAB de la IA
  // ============================================================
  btnMiUbicacion: {
    position: 'absolute',
    bottom: 175,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    zIndex: 40,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },

  // ============================================================
  // Bottom Sheet estilo Google Maps
  // ============================================================
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DADCE0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    letterSpacing: 0.1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  cardAddress: {
    fontSize: 13,
    color: '#5F6368',
    lineHeight: 18,
    flex: 1,
  },
  closeCardButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  metricItem: { alignItems: 'center' },
  metricBigValue: { fontSize: 20, fontWeight: '700', color: '#1A73E8' },
  metricLabel: { fontSize: 11, color: '#70757A', marginTop: 2 },
  metricDivider: { width: 1, height: 28, backgroundColor: '#DADCE0' },

  // ============================================================
  // Selector de transporte estilo Google Maps
  // ============================================================
  transportSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    padding: 3,
    marginTop: 10,
  },
  transportBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
  },
  transportBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transportBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#70757A',
    marginTop: 2,
  },
  transportBtnTextActive: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  transportBtnTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A73E8',
    backgroundColor: '#E8F0FE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 3,
    overflow: 'hidden',
  },

  // ============================================================
  // Botón Iniciar Navegación
  // ============================================================
  btnNavegar: {
    backgroundColor: '#1A73E8',
    borderRadius: 24,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ============================================================
  // Botón Salir de Navegación
  // ============================================================
  btnSalirNav: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#D93025', // Rojo Google
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
});
