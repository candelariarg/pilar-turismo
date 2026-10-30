import { LocationCoords, RouteData, Place, PlaceCategory, NominatimPlaceResponse } from './type';

// ============================================================
// Configuración de URLs para las APIs de mapas y ruteo
// OpenRouteService (rutas precisas), OSRM (respaldo) y Nominatim (búsqueda de lugares)
// ============================================================
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
// ============================================================

// ============================================================
// Convierte el modo de transporte de la app al perfil que requiere OpenRouteService
// (driving -> driving-car, foot -> foot-walking, bike -> cycling-regular)
// ============================================================
const getOrsProfile = (mode: 'driving' | 'foot' | 'bike'): string => {
    switch (mode) {
        case 'foot': return 'foot-walking';
        case 'bike': return 'cycling-regular';
        case 'driving':
        default:
            return 'driving-car';
    }
};
// ============================================================

// ============================================================
// Obtiene la ruta entre dos puntos usando la API de OpenRouteService (ORS)
// Si no hay API key o hay error de red, utiliza OSRM como respaldo automático
// ============================================================
export const fetchRouteOSRM = async (
    origin: LocationCoords,
    destination: LocationCoords,
    mode: 'driving' | 'foot' | 'bike' = 'driving'
): Promise<RouteData | null> => {
    const apiKey = process.env.EXPO_PUBLIC_ORS_API_KEY;

    // 1. Intento principal con OpenRouteService
    if (apiKey) {
        try {
            const profile = getOrsProfile(mode);
            const url = `${ORS_BASE_URL}/${profile}?api_key=${apiKey}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`;

            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json, application/geo+json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const routeCoordinates: LocationCoords[] = feature.geometry.coordinates.map(
                        (coord: [number, number]) => ({
                            latitude: coord[1],
                            longitude: coord[0],
                        })
                    );

                    const summary = feature.properties?.summary;
                    return {
                        distanceKm: summary ? parseFloat((summary.distance / 1000).toFixed(1)) : 0,
                        durationMin: summary ? Math.round(summary.duration / 60) : 0,
                        coordinates: routeCoordinates,
                    };
                }
            } else {
                console.warn(`[OpenRouteService] Respuesta no exitosa (${response.status}), intentando fallback...`);
            }
        } catch (error) {
            console.warn('[OpenRouteService] Error al consultar ORS, usando fallback OSRM:', error);
        }
    }

    // 2. Respaldo (Fallback) a OSRM si no hay API Key o falla ORS
    try {
        const coordinatesString = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
        const osrmMode = mode === 'bike' ? 'driving' : mode;
        const url = `${OSRM_BASE_URL}/${osrmMode}/${coordinatesString}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error OSRM: ${response.status}`);

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeCoordinates: LocationCoords[] = route.geometry.coordinates.map((coord: [number, number]) => ({
                latitude: coord[1],
                longitude: coord[0],
            }));

            return {
                distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
                durationMin: Math.round(route.duration / 60),
                coordinates: routeCoordinates,
            };
        }
        return null;
    } catch (error) {
        console.error('Error al obtener ruta:', error);
        return null;
    }
};
// ============================================================

// ============================================================
// Función auxiliar para calcular distancia en km entre dos coordenadas (Fórmula Haversine)
// ============================================================
export const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
// ============================================================

// ============================================================
// Construye el parámetro viewbox centrado en el usuario con un radio específico en km
// ============================================================
const buildViewbox = (location: LocationCoords, radiusKm: number): string => {
    const deltaLat = radiusKm / 111;
    const cosLat = Math.cos((location.latitude * Math.PI) / 180);
    const deltaLon = radiusKm / (111 * (Math.abs(cosLat) || 0.8));

    const minLon = (location.longitude - deltaLon).toFixed(6);
    const maxLat = (location.latitude + deltaLat).toFixed(6);
    const maxLon = (location.longitude + deltaLon).toFixed(6);
    const minLat = (location.latitude - deltaLat).toFixed(6);
    return `&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`;
};
// ============================================================

// ============================================================
// Consulta a Nominatim para un término específico y un radio determinado
// ============================================================
const executeQuery = async (
    queryTerm: string,
    location?: LocationCoords | null,
    radiusKm: number = 6
): Promise<NominatimPlaceResponse[]> => {
    let url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(queryTerm)}&format=json&limit=15`;
    if (location) {
        url += buildViewbox(location, radiusKm);
    } else {
        url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(`${queryTerm} in Pilar, Santa Fe`)}&format=json&limit=15`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PilarTurismoApp/1.0',
            },
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        return [];
    }
};
// ============================================================

// ============================================================
// Mapeo de categorías a términos de búsqueda reconocidos en OpenStreetMap
// ============================================================
const getCategoryQueries = (category: PlaceCategory): string[] => {
    switch (category) {
        case 'hospital': return ['hospital', 'clinica'];
        case 'police': return ['police', 'comisaria'];
        case 'supermarket': return ['supermarket', 'supermercado'];
        case 'restaurant': return ['restaurant', 'restaurante'];
        case 'park': return ['park', 'plaza'];
        case 'tourism': return ['tourism', 'iglesia'];
        case 'all': return ['tourism', 'attractions'];
        default: return [category];
    }
};
// ============================================================

// ============================================================
// Busca lugares por categoría con prioridad absoluta a lo cercano (Google Maps style)
// ============================================================
export const fetchPlacesOSM = async (
    category: PlaceCategory,
    userLocation?: LocationCoords | null
): Promise<Place[]> => {
    try {
        const queries = getCategoryQueries(category);
        let data: NominatimPlaceResponse[] = [];

        if (userLocation) {
            // 1. PRIORIDAD ABSOLUTA LOCAL: Buscar dentro del radio cercano (6 km a la redonda)
            for (const q of queries) {
                const res = await executeQuery(q, userLocation, 6);
                if (res && res.length > 0) {
                    data = res;
                    break;
                }
            }

            // 2. Solo si no existe ningún lugar cercano en 6 km, expandir a radio medio (18 km)
            if (data.length === 0) {
                for (const q of queries) {
                    const res = await executeQuery(q, userLocation, 18);
                    if (res && res.length > 0) {
                        data = res;
                        break;
                    }
                }
            }

            // 3. Si aún no hay nada (ej: grandes hipermercados), buscar a nivel comarcal (35 km)
            if (data.length === 0) {
                for (const q of queries) {
                    const res = await executeQuery(q, userLocation, 35);
                    if (res && res.length > 0) {
                        data = res;
                        break;
                    }
                }
            }
        } else {
            data = await executeQuery(queries[0], null);
        }

        let lugaresFormateados: Place[] = data.map((item) => {
            const shortName = item.name || item.display_name.split(',')[0];
            return {
                id: item.place_id.toString(),
                name: shortName,
                category: category,
                categoryName: category === 'all' ? 'Lugar' : category.charAt(0).toUpperCase() + category.slice(1),
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                address: item.display_name,
            };
        });

        // Ordenar siempre por proximidad estricta al usuario (el más cercano primero)
        if (userLocation) {
            lugaresFormateados.sort((a, b) => {
                const distA = calculateDistanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
                const distB = calculateDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
                return distA - distB;
            });
        }

        return lugaresFormateados;

    } catch (error) {
        console.error('Error al buscar lugares en Nominatim:', error);
        return [];
    }
};
// ============================================================

// ============================================================
// Busca cualquier lugar por texto libre con prioridad a lo local
// Solo si el usuario busca algo que no está en el radio local, se amplía
// ============================================================
export const searchPlacesOSM = async (
    query: string,
    userLocation?: LocationCoords | null
): Promise<Place[]> => {
    try {
        let data: NominatimPlaceResponse[] = [];

        if (userLocation) {
            // 1. Prioridad: buscar primero en radio local cercano (8 km)
            data = await executeQuery(query, userLocation, 8);

            // 2. Si no se encontró nada localmente con ese nombre, ampliar a nivel regional (35 km)
            if (!data || data.length === 0) {
                data = await executeQuery(query, userLocation, 35);
            }
        } else {
            data = await executeQuery(query, null);
        }

        let lugaresFormateados: Place[] = data.map((item) => {
            const shortName = item.name || item.display_name.split(',')[0];
            return {
                id: item.place_id.toString(),
                name: shortName,
                category: 'all',
                categoryName: 'Búsqueda',
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                address: item.display_name,
            };
        });

        if (userLocation) {
            lugaresFormateados.sort((a, b) => {
                const distA = calculateDistanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
                const distB = calculateDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
                return distA - distB;
            });
        }

        return lugaresFormateados;
    } catch (error) {
        console.error('Error al buscar lugares en Nominatim:', error);
        return [];
    }
};
// ============================================================
