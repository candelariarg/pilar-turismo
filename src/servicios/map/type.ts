// exportamos de expo-location por si lo necesitamos más adelante
import { LocationObjectCoords } from "expo-location";

// Categorías de lugares que vamos a poder buscar en el mapa
// 'all' es para cuando queremos mostrar todos sin filtro
export type PlaceCategory = 'hospital' | 'police' | 'supermarket' | 'restaurant' | 'park' | 'tourism' | 'all';

// Coordenadas simples para usar en nuestro código (sin toda la data extra del GPS)
export interface LocationCoords {
    latitude: number;
    longitude: number;
}

// Estructura de un Lugar (Punto de Interés)
// Esta es la estructura final que usará nuestra pantalla, sin importar 
// si los datos vienen de Nominatim, Firebase o nuestra lista local.
export interface Place {
    id: string;               // ID único (puede ser el ID de OpenStreetMap)
    name: string;             // Nombre del lugar (ej. "Hospital Austral")
    category: PlaceCategory;  // Categoría interna para filtrar
    categoryName: string;     // Nombre legible para mostrar en pantalla (ej. "Hospital")
    latitude: number;         // Latitud exacta
    longitude: number;        // Longitud exacta
    address: string;          // Dirección aproximada
}

// Estructura de los datos de una Ruta (para trazar el camino)
export interface RouteData {
    distanceKm: number;           // Distancia total en Kilómetros
    durationMin: number;          // Tiempo estimado en Minutos
    coordinates: LocationCoords[]; // Lista de todos los puntitos que forman la línea de la ruta
}

// =====================================================================
// TIPOS PARA LA API DE NOMINATIM (OPENSTREETMAP)
// =====================================================================

// Así es como nos devuelve los datos la API de Nominatim cuando buscamos un lugar.
// Lo definimos aquí para que TypeScript nos ayude cuando hagamos el fetch en mapServices.
export interface NominatimPlaceResponse {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    category: string; // ej: "amenity"
    type: string;     // ej: "hospital"
    name: string;
}