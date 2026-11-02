import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Place, PlaceCategory, LocationCoords, RouteData } from '../servicios/map/type';
import { fetchPlacesOSM, fetchRouteOSRM, searchPlacesOSM } from '../servicios/map/mapServices';

// Definimos los tipos de transporte soportados
export type TransportMode = 'driving' | 'foot' | 'transit';

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
    // 1. Obtener Ubicación del Usuario al iniciar el mapa (sin cargar lugares automáticos)
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
                const coords: LocationCoords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setUserLocation(coords);

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
    const loadPlaces = async (category: PlaceCategory, overrideLocation?: LocationCoords) => {
        setLoading(true);
        setRouteData(null); 
        setSelectedPlace(null);

        const loc = overrideLocation || userLocation;
        const fetchedPlaces = await fetchPlacesOSM(category, loc);
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
        
        const fetchedPlaces = await searchPlacesOSM(query, userLocation);
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
    // 5. Función para cambiar el medio de transporte (Auto, A pie, Transporte) y recalcular ruta
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

    // ============================================================
    // 7. Función para limpiar los lugares marcados en el mapa
    // ============================================================
    const clearPlaces = () => {
        setPlaces([]);
        setSelectedPlace(null);
        setRouteData(null);
    };
    // ============================================================

    // Selección manual: no calculamos la ruta automáticamente hasta que el usuario toque "Cómo llegar"

    // ============================================================
    // 8. Función para enfocar y marcar un lugar recibido desde otra pantalla
    // ============================================================
    const focusOnPlace = async (
        nombre?: string,
        direccion?: string,
        lat?: number,
        lon?: number
    ): Promise<Place | null> => {
        setLoading(true);
        setRouteData(null);
        setSelectedPlace(null);

        // A. Si se enviaron coordenadas exactas
        if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
            const place: Place = {
                id: 'dest-' + Date.now(),
                name: nombre || direccion || 'Lugar seleccionado',
                category: 'all',
                categoryName: 'Turismo',
                latitude: lat,
                longitude: lon,
                address: direccion || nombre || '',
            };
            setPlaces([place]);
            setSelectedPlace(place);
            setRouteData(null);
            setLoading(false);
            return place;
        }

        // B. Si no hay coordenadas, buscamos con Nominatim priorizando el nombre del lugar
        let found: Place[] = [];

        // 1. Probar primero por el nombre directo (es el más exacto en OSM, ej: "Parroquia Nuestra Señora del Pilar")
        if (nombre) {
            found = await searchPlacesOSM(nombre, userLocation);
            if (!found || found.length === 0) {
                found = await searchPlacesOSM(`${nombre}, Pilar`, userLocation);
            }
        }

        // 2. Si no hubo resultados con el nombre, buscar por dirección en Pilar
        if ((!found || found.length === 0) && direccion) {
            found = await searchPlacesOSM(`${direccion}, Pilar`, userLocation);
            if (!found || found.length === 0) {
                found = await searchPlacesOSM(direccion, userLocation);
            }
        }

        if (found && found.length > 0) {
            const target = found[0];
            if (nombre) {
                target.name = nombre;
            }
            if (direccion) {
                target.address = direccion;
            }
            setPlaces([target]);
            setSelectedPlace(target);
            setRouteData(null);
            setLoading(false);
            return target;
        }

        setLoading(false);
        return null;
    };
    // ============================================================

    return {
        userLocation,
        places,
        selectedPlace,
        setSelectedPlace,
        setRouteData,
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
        focusOnPlace,
    };
};
