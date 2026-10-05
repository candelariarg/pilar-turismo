import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Place, PlaceCategory, LocationCoords, RouteData } from '../servicios/map/type';
import { fetchPlacesOSM, fetchRouteOSRM } from '../servicios/map/mapServices';

// Definimos los tipos de transporte soportados
export type TransportMode = 'driving' | 'foot' | 'bike';

export const useMaps = () => {
    // ==========================================
    // ESTADOS
    // ==========================================
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // NUEVO ESTADO: Guardamos cómo quiere viajar el usuario (por defecto 'driving')
    const [transportMode, setTransportMode] = useState<TransportMode>('driving');

    // ==========================================
    // 1. Obtener Ubicación del Usuario al iniciar
    // ==========================================
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

    // ==========================================
    // 2. Función para cargar lugares según categoría
    // ==========================================
    const loadPlaces = async (category: PlaceCategory) => {
        setLoading(true);
        setRouteData(null); 
        setSelectedPlace(null);

        const fetchedPlaces = await fetchPlacesOSM(category);
        setPlaces(fetchedPlaces);
        setLoading(false);
    };

    // ==========================================
    // 3. Función para trazar ruta hacia un lugar
    // ==========================================
    // Ahora le pasamos el modo de transporte a la API
    const calculateRouteTo = async (place: Place, mode: TransportMode = transportMode) => {
        setSelectedPlace(place); 

        if (userLocation) {
            setLoading(true);
            const destination = { latitude: place.latitude, longitude: place.longitude };
            // Llamamos a la API con el modo seleccionado (ej: 'foot' o 'driving')
            const route = await fetchRouteOSRM(userLocation, destination, mode);
            setRouteData(route);
            setLoading(false);
        } else {
            alert('Aún no tenemos tu ubicación GPS');
        }
    };

    // ==========================================
    // 4. Cambiar de Medio de Transporte
    // ==========================================
    const changeTransportMode = async (mode: TransportMode) => {
        setTransportMode(mode);
        // Si ya hay un lugar seleccionado, recalculamos la ruta automáticamente
        if (selectedPlace) {
            await calculateRouteTo(selectedPlace, mode);
        }
    };

    // ==========================================
    // 5. Función para limpiar la selección
    // ==========================================
    const clearSelection = () => {
        setSelectedPlace(null);
        setRouteData(null);
    };

    return {
        userLocation,
        places,
        selectedPlace,
        routeData,
        loading,
        errorMsg,
        transportMode,
        loadPlaces,
        calculateRouteTo,
        changeTransportMode,
        clearSelection
    };
};
