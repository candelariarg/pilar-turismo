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

// Pasos detallados del viaje en transporte público
export interface TransitStep {
    type: 'walk' | 'bus' | 'train';
    instruction: string;
    lineName?: string;          // Ej: "Línea 57" o "Línea 203"
    headsign?: string;          // Ej: "Ramal Pilar Centro"
    durationMin: number;
    distanceKm: number;
    stopsCount?: number;
    color?: string;             // Color representativo (ej: "#0288D1", "#D32F2F")
    departureStop?: string;     // Nombre de la parada donde se sube
    arrivalStop?: string;       // Nombre de la parada donde se baja
    coordinates: LocationCoords[];
}

// Resumen general de la ruta de transporte
export interface TransitSummary {
    lineName: string;
    headsign: string;
    frequencyText: string;
    nextArrivalMin: number;
    totalWalkMin: number;
    totalTransitMin: number;
    stopsCount: number;
}

// Estructura de los datos de una Ruta (para trazar el camino)
export interface RouteData {
    distanceKm: number;           // Distancia total en Kilómetros
    durationMin: number;          // Tiempo estimado en Minutos
    coordinates: LocationCoords[]; // Lista de todos los puntitos que forman la línea de la ruta
    mode?: 'driving' | 'foot' | 'transit';
    transitSteps?: TransitStep[];
    transitSummary?: TransitSummary;
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
