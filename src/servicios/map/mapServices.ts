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
// Busca lugares (Puntos de Interés) por categoría usando Nominatim de OpenStreetMap
// ============================================================
export const fetchPlacesOSM = async (category: PlaceCategory): Promise<Place[]> => {
    try {
        const queryTerm = category === 'all' ? 'tourist attractions' : category;
        const q = `${queryTerm} in Pilar, Buenos Aires`;
        const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(q)}&format=json&limit=15`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PilarTurismoApp/1.0',
            },
        });

        if (!response.ok) throw new Error(`Error Nominatim: ${response.status}`);

        const data: NominatimPlaceResponse[] = await response.json();

        const lugaresFormateados: Place[] = data.map((item) => {
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

        return lugaresFormateados;

    } catch (error) {
        console.error('Error al buscar lugares en Nominatim:', error);
        return [];
    }
};
// ============================================================

// ============================================================
// Busca cualquier lugar por texto libre en Pilar usando OpenStreetMap (Nominatim)
// ============================================================
export const searchPlacesOSM = async (query: string): Promise<Place[]> => {
    try {
        const q = `${query} in Pilar, Buenos Aires`;
        const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(q)}&format=json&limit=15`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PilarTurismoApp/1.0',
            },
        });

        if (!response.ok) throw new Error(`Error Nominatim: ${response.status}`);

        const data: NominatimPlaceResponse[] = await response.json();

        return data.map((item) => {
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
    } catch (error) {
        console.error('Error al buscar lugares en Nominatim:', error);
        return [];
    }
};
// ============================================================
