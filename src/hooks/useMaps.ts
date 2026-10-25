import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Place, PlaceCategory, LocationCoords, RouteData } from '../servicios/map/type';
import { fetchPlacesOSM, fetchRouteOSRM, searchPlacesOSM } from '../servicios/map/mapServices';

// Definimos los tipos de transporte soportados
export type TransportMode = 'driving' | 'foot' | 'bike';

export const useMaps = () => {
    // ============================================================
    // Estados principales del mapa (ubicación, lugares, ruta, carga y modo de viaje)
    // ============================================================
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [transportMode, setTransportMode] = useState<TransportMode>('driving');
    // ============================================================

    // ============================================================
    // 1. Obtener Ubicación del Usuario al iniciar y cargar lugares iniciales
    // ============================================================
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permiso de ubicación denegado');
                    setLoading(false);
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
                
                await loadPlaces('all');

            } catch (error) {
                setErrorMsg('Error al obtener la ubicación');
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    // ============================================================

    // ============================================================
    // 2. Función para cargar lugares según la categoría seleccionada
    // ============================================================
    const loadPlaces = async (category: PlaceCategory) => {
        setLoading(true);
        setRouteData(null); 
        setSelectedPlace(null);

        const fetchedPlaces = await fetchPlacesOSM(category);
        setPlaces(fetchedPlaces);
        setLoading(false);
    };
    // ============================================================

    // ============================================================
    // 3. Función que ejecuta la búsqueda de lugares por texto libre en Pilar
    // ============================================================
    const searchPlaces = async (query: string) => {
        if (!query.trim()) return;
        setLoading(true);
        setRouteData(null);
        setSelectedPlace(null);
        
        const fetchedPlaces = await searchPlacesOSM(query);
        setPlaces(fetchedPlaces);
        setLoading(false);
    };
    // ============================================================

    // ============================================================
    // 4. Función para trazar ruta hacia un lugar según el modo de transporte
    // ============================================================
    const calculateRouteTo = async (place: Place, mode: TransportMode = transportMode) => {
        setSelectedPlace(place); 

        if (userLocation) {
            setLoading(true);
            const destination = { latitude: place.latitude, longitude: place.longitude };
            const route = await fetchRouteOSRM(userLocation, destination, mode);
            setRouteData(route);
            setLoading(false);
        } else {
            alert('Aún no tenemos tu ubicación GPS');
        }
    };
    // ============================================================

    // ============================================================
    // 5. Función para cambiar el medio de transporte (Auto, A pie, Bici) y recalcular ruta
    // ============================================================
    const changeTransportMode = async (mode: TransportMode) => {
        setTransportMode(mode);
        if (selectedPlace) {
            await calculateRouteTo(selectedPlace, mode);
        }
    };
    // ============================================================

    // ============================================================
    // 6. Función para limpiar la selección del lugar y la ruta actual
    // ============================================================
    const clearSelection = () => {
        setSelectedPlace(null);
        setRouteData(null);
    };
    // ============================================================

    return {
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
        clearSelection
    };
};
