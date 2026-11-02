import { LocationCoords, RouteData, Place, PlaceCategory, NominatimPlaceResponse, TransitStep, TransitSummary } from './type';
import { decode as decodeFlexPolyline } from '@here/flexpolyline';

// ============================================================
// Configuración de URLs para las APIs de mapas y ruteo
// OpenRouteService (rutas precisas), OSRM (respaldo) y Nominatim (búsqueda de lugares)
// ============================================================
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const HERE_TRANSIT_BASE_URL = 'https://transit.router.hereapi.com/v8/routes';
// ============================================================

// ============================================================
// Convierte el modo de transporte de la app al perfil que requiere OpenRouteService
// (driving -> driving-car, foot -> foot-walking, bike -> cycling-regular)
// ============================================================
const getOrsProfile = (mode: 'driving' | 'foot' | 'transit'): string => {
    switch (mode) {
        case 'foot': return 'foot-walking';

        case 'driving':
        default:
            return 'driving-car';
    }
};
// ============================================================

// ============================================================
// ============================================================
// Genera una ruta realista simulada de transporte público para Pilar
// Diseñada para maquetación y pruebas visuales sin gastar consultas de API
// ============================================================
export const generateSimulatedTransitRoute = async (
    origin: LocationCoords,
    destination: LocationCoords
): Promise<RouteData | null> => {
    // 1. Obtener el trazado real por calles usando el motor de ruteo
    const baseRoute = await fetchRouteOSRM(origin, destination, 'driving');
    const coords = (baseRoute && baseRoute.coordinates.length > 0)
        ? baseRoute.coordinates
        : [origin, destination];

    const dist = baseRoute ? baseRoute.distanceKm : 3.0;
    const baseDuration = baseRoute ? baseRoute.durationMin : 10;
    const totalPoints = coords.length;

    // 2. Elegir la línea icónica de Pilar según la distancia del viaje
    interface PilarPreset {
        name: string;
        headsign: string;
        color: string;
        frequency: string;
        stopDepart: string;
        stopArrive: string;
    }

    let preset: PilarPreset;
    if (dist < 3.5) {
        preset = {
            name: 'Línea 501',
            headsign: 'Ramal Villa Rosa - Pilar Centro',
            color: '#2E7D32', // Verde
            frequency: 'Cada 10 - 12 min',
            stopDepart: 'Parada Av. Tratado del Pilar',
            stopArrive: 'Parada Plaza 12 de Octubre',
        };
    } else if (dist < 8) {
        preset = {
            name: 'Línea 203',
            headsign: 'Ramal Pte. Saavedra - Pilar',
            color: '#D32F2F', // Rojo
            frequency: 'Cada 8 - 10 min',
            stopDepart: 'Parada Terminal Pilar',
            stopArrive: 'Parada Colectora Panamericana',
        };
    } else {
        preset = {
            name: 'Línea 57',
            headsign: 'Ramal Expreso Panamericana',
            color: '#0288D1', // Azul Bondi
            frequency: 'Cada 12 - 15 min',
            stopDepart: 'Terminal de Ómnibus Pilar',
            stopArrive: 'Parada Palmas del Pilar',
        };
    }

    // 3. Dividir el trayecto en 3 etapas: Caminata inicial -> Tramo Colectivo -> Caminata final
    let walk1Coords: LocationCoords[] = [];
    let busCoords: LocationCoords[] = [];
    let walk2Coords: LocationCoords[] = [];

    if (totalPoints >= 6) {
        const idx1 = Math.max(1, Math.floor(totalPoints * 0.12));
        const idx2 = Math.min(totalPoints - 1, Math.floor(totalPoints * 0.88));

        walk1Coords = coords.slice(0, idx1 + 1);
        busCoords = coords.slice(idx1, idx2 + 1);
        walk2Coords = coords.slice(idx2);
    } else {
        walk1Coords = [coords[0], coords[0]];
        busCoords = coords;
        walk2Coords = [coords[coords.length - 1], coords[coords.length - 1]];
    }

    const walk1Dist = parseFloat((dist * 0.10).toFixed(2));
    const busDist = parseFloat((dist * 0.80).toFixed(2));
    const walk2Dist = parseFloat((dist * 0.10).toFixed(2));

    const walk1Min = Math.max(2, Math.round(walk1Dist * 12));
    const busMin = Math.max(5, Math.round(baseDuration * 1.35));
    const walk2Min = Math.max(2, Math.round(walk2Dist * 12));

    const totalDurationMin = walk1Min + busMin + walk2Min;
    const stopsCount = Math.max(2, Math.round(busDist * 2.2));

    const steps: TransitStep[] = [
        {
            type: 'walk',
            instruction: 'Caminar hasta la parada de colectivo',
            departureStop: 'Tu ubicación actual',
            arrivalStop: preset.stopDepart,
            durationMin: walk1Min,
            distanceKm: walk1Dist,
            coordinates: walk1Coords,
        },
        {
            type: 'bus',
            instruction: `Tomar ${preset.name} (${preset.headsign})`,
            lineName: preset.name,
            headsign: preset.headsign,
            color: preset.color,
            departureStop: preset.stopDepart,
            arrivalStop: preset.stopArrive,
            durationMin: busMin,
            distanceKm: busDist,
            stopsCount: stopsCount,
            coordinates: busCoords,
        },
        {
            type: 'walk',
            instruction: 'Caminar hasta el destino',
            departureStop: preset.stopArrive,
            arrivalStop: 'Destino final',
            durationMin: walk2Min,
            distanceKm: walk2Dist,
            coordinates: walk2Coords,
        },
    ];

    const summary: TransitSummary = {
        lineName: preset.name,
        headsign: preset.headsign,
        frequencyText: preset.frequency,
        nextArrivalMin: Math.floor(Math.random() * 4) + 3,
        totalWalkMin: walk1Min + walk2Min,
        totalTransitMin: busMin,
        stopsCount: stopsCount,
    };

    return {
        distanceKm: dist,
        durationMin: totalDurationMin,
        coordinates: coords,
        mode: 'transit',
        transitSteps: steps,
        transitSummary: summary,
    };
};

// ============================================================
// Obtiene la ruta de transporte público usando HERE Public Transit API v8
// Si no hay API key o la ruta falla, recurre a la simulación realista de Pilar
// ============================================================
export const fetchRouteHereTransit = async (
    origin: LocationCoords,
    destination: LocationCoords
): Promise<RouteData | null> => {
    const hereApiKey = process.env.EXPO_PUBLIC_HERE_API_KEY;

    // Si la API key está vacía o es de ejemplo, usamos la simulación visual sin gastar peticiones
    if (!hereApiKey || hereApiKey.trim() === '' || hereApiKey.includes('tu_api_key')) {
        return await generateSimulatedTransitRoute(origin, destination);
    }

    try {
        const url = `${HERE_TRANSIT_BASE_URL}?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&return=polyline,travelSummary&apiKey=${hereApiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[HERE Transit] Respuesta no exitosa (${response.status}), usando simulación...`);
            return await generateSimulatedTransitRoute(origin, destination);
        }

        const data = await response.json();
        if (!data.routes || data.routes.length === 0) {
            console.warn('[HERE Transit] No se encontraron rutas de transporte público. Usando simulación...');
            return await generateSimulatedTransitRoute(origin, destination);
        }

        const route = data.routes[0];
        let totalDurationSec = 0;
        let totalLengthM = 0;
        const coordinates: LocationCoords[] = [];

        if (route.sections && Array.isArray(route.sections)) {
            for (const section of route.sections) {
                if (section.travelSummary) {
                    totalDurationSec += section.travelSummary.duration || 0;
                    totalLengthM += section.travelSummary.length || 0;
                }
                if (section.polyline) {
                    try {
                        const decoded = decodeFlexPolyline(section.polyline);
                        if (decoded && Array.isArray(decoded.polyline)) {
                            for (const pt of decoded.polyline) {
                                coordinates.push({
                                    latitude: pt[0],
                                    longitude: pt[1],
                                });
                            }
                        }
                    } catch (decErr) {
                        console.warn('[HERE Transit] Error al decodificar flexible polyline:', decErr);
                    }
                }
            }
        }

        if (coordinates.length === 0) {
            return await generateSimulatedTransitRoute(origin, destination);
        }

        return {
            distanceKm: parseFloat((totalLengthM / 1000).toFixed(1)),
            durationMin: Math.max(1, Math.round(totalDurationSec / 60)),
            coordinates,
            mode: 'transit',
        };
    } catch (error) {
        console.warn('[HERE Transit] Excepción al consultar HERE Transit API, usando simulación:', error);
        return await generateSimulatedTransitRoute(origin, destination);
    }
};
// ============================================================

// Obtiene la ruta entre dos puntos usando la API de OpenRouteService (ORS) o HERE Transit
// Si no hay API key o hay error de red, utiliza OSRM como respaldo automático
// ============================================================
export const fetchRouteOSRM = async (
    origin: LocationCoords,
    destination: LocationCoords,
    mode: 'driving' | 'foot' | 'transit' = 'driving'
): Promise<RouteData | null> => {
    // 1. Si el modo elegido es transporte público, delegar a HERE Public Transit API
    if (mode === 'transit') {
        return await fetchRouteHereTransit(origin, destination);
    }

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
                        mode,
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
        const osrmMode = mode === 'foot' ? 'foot' : 'driving';
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
                        mode,
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

// Coordenadas geográficas por defecto del centro de Pilar, Buenos Aires
const PILAR_CENTRO_COORDS: LocationCoords = { latitude: -34.4587, longitude: -58.9142 };

// ============================================================
// Consulta a Nominatim para un término específico y un radio determinado
// ============================================================
const executeQuery = async (
    queryTerm: string,
    location?: LocationCoords | null,
    radiusKm: number = 6
): Promise<NominatimPlaceResponse[]> => {
    // Si no tenemos ubicación GPS todavía, delimitamos la búsqueda al centro de Pilar
    const loc = location || PILAR_CENTRO_COORDS;
    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(queryTerm)}&format=json&limit=15${buildViewbox(loc, radiusKm)}`;

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

        const loc = userLocation || PILAR_CENTRO_COORDS;
        // 1. Prioridad: buscar primero en radio local cercano (8 km)
        data = await executeQuery(query, loc, 8);

        // 2. Si no se encontró nada localmente con ese nombre, ampliar a nivel regional (35 km)
        if (!data || data.length === 0) {
            data = await executeQuery(query, loc, 35);
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
