import { LocationCoords, RouteData, Place, PlaceCategory, NominatimPlaceResponse } from './type';

// URL base de la API pública y gratuita de OSRM (sin el /driving al final)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

// URL base de Nominatim (OpenStreetMap) para buscar lugares
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Obtiene la ruta entre dos puntos usando la API de OSRM (Open Source Routing Machine)
 */
export const fetchRouteOSRM = async (origin: LocationCoords, destination: LocationCoords, mode: 'driving' | 'foot' | 'bike' = 'driving'): Promise<RouteData | null> => {
    try {
        const coordinatesString = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
        // Armamos la URL inyectando el medio de transporte (driving, foot, bike)
        const url = `${OSRM_BASE_URL}/${mode}/${coordinatesString}?overview=full&geometries=geojson`;

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
        console.error("Error al obtener ruta OSRM:", error);
        return null;
    }
};


/**
 * Busca lugares (Puntos de Interés) usando la API de Nominatim de OpenStreetMap
 * 
 * @param category - La categoría del lugar que queremos buscar
 * @returns Promesa con una lista de lugares adaptada a nuestra interfaz Place
 */
export const fetchPlacesOSM = async (category: PlaceCategory): Promise<Place[]> => {
    try {
        // 1. Armamos el término de búsqueda.
        // Si nos piden 'all', buscamos atracciones en general. Si no, usamos la categoría (ej: "hospital").
        const queryTerm = category === 'all' ? 'tourist attractions' : category;
        
        // 2. Le indicamos que busque específicamente en Pilar, Buenos Aires.
        const q = `${queryTerm} in Pilar, Buenos Aires`;
        
        // 3. Armamos la URL. format=json es necesario, y limit=15 para no traer demasiados resultados.
        const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(q)}&format=json&limit=15`;

        // Nominatim pide por cortesía que enviemos un User-Agent (identificador) de nuestra app
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'PilarTurismoApp/1.0'
            }
        });

        if (!response.ok) throw new Error(`Error Nominatim: ${response.status}`);

        const data: NominatimPlaceResponse[] = await response.json();

        // 4. Transformamos los datos "crudos" de Nominatim a nuestro formato limpio 'Place'
        const lugaresFormateados: Place[] = data.map((item) => {
            // Nominatim devuelve display_name muy largo (ej: "Hospital Austral, Avenida..., Pilar...").
            // Nos quedamos solo con la primera parte antes de la primera coma para el título.
            const shortName = item.name || item.display_name.split(',')[0];

            return {
                id: item.place_id.toString(), // Convertimos el número a texto
                name: shortName,
                category: category,
                // Traducimos un poco el nombre de la categoría para mostrarlo en pantalla
                categoryName: category === 'all' ? 'Lugar' : category.charAt(0).toUpperCase() + category.slice(1),
                // MUY IMPORTANTE: Nominatim devuelve las coordenadas como texto ("-34.56"), 
                // nosotros las necesitamos como números decimales. Usamos parseFloat.
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                address: item.display_name,
            };
        });

        return lugaresFormateados;

    } catch (error) {
        console.error("Error al buscar lugares en Nominatim:", error);
        return []; // Si falla, devolvemos una lista vacía para que no se rompa la app
    }
};