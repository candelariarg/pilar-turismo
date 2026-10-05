import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationCoords, Place, RouteData } from '../servicios/map/type';

interface LeafletMapProps {
  userLocation: LocationCoords;
  places: Place[];
  routeData: RouteData | null;
  onMarkerPress: (placeId: string) => void;
}

// Esta función genera todo el HTML + CSS + JavaScript del mapa Leaflet
// Se ejecuta dentro de un WebView (como una mini página web dentro de la app)
const generateMapHTML = (
  userLocation: LocationCoords,
  places: Place[],
  routeData: RouteData | null
): string => {

  // Colores según categoría
  const getColor = (cat: string) => {
    switch (cat) {
      case 'hospital': return '#E53935';
      case 'police': return '#1E88E5';
      case 'supermarket': return '#43A047';
      case 'restaurant': return '#FB8C00';
      case 'park': return '#4CAF50';
      case 'tourism': return '#8E24AA';
      default: return '#757575';
    }
  };

  // Emoji según categoría
  const getEmoji = (cat: string) => {
    switch (cat) {
      case 'hospital': return '🏥';
      case 'police': return '👮';
      case 'supermarket': return '🛒';
      case 'restaurant': return '🍽️';
      case 'park': return '🌳';
      case 'tourism': return '⛪';
      default: return '📍';
    }
  };

  // Generamos los marcadores como código JavaScript
  const markersJS = places.map((p) => {
    const color = getColor(p.category);
    const emoji = getEmoji(p.category);
    // Escapamos comillas simples en el nombre por seguridad
    const safeName = p.name.replace(/'/g, "\\'");
    const safeAddr = p.address.replace(/'/g, "\\'");
    return `
      L.marker([${p.latitude}, ${p.longitude}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-size:18px;">${emoji}</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      })
      .addTo(map)
      .bindPopup('<b>${safeName}</b><br>${safeAddr}')
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', placeId: '${p.id}' }));
      });
    `;
  }).join('\n');

  // Si hay ruta, generamos la polyline
  const routeJS = routeData
    ? `L.polyline([${routeData.coordinates.map(c => `[${c.latitude},${c.longitude}]`).join(',')}], {
        color: '#2196F3',
        weight: 6,
        opacity: 0.85
      }).addTo(map);`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        html, body, #map { width: 100%; height: 100%; }
        .custom-marker { background: none !important; border: none !important; }
        .user-pulse {
          width: 20px; height: 20px;
          background: rgba(33, 150, 243, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .user-dot {
          width: 14px; height: 14px;
          background: #2196F3;
          border: 3px solid white;
          border-radius: 50%;
          position: absolute;
          top: 3px; left: 3px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false
        }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);

        // Cargamos las imágenes de OpenStreetMap (100% gratis, sin API Key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19
        }).addTo(map);

        // Marcador del usuario (punto azul con animación)
        L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="position:relative;width:20px;height:20px;"><div class="user-pulse"></div><div class="user-dot"></div></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }),
          zIndexOffset: 1000
        }).addTo(map).bindPopup('📍 Tu ubicación');

        // Marcadores de los lugares
        ${markersJS}

        // Ruta dibujada (si existe)
        ${routeJS}
      </script>
    </body>
    </html>
  `;
};

export default function LeafletMap({ userLocation, places, routeData, onMarkerPress }: LeafletMapProps) {

  const htmlContent = generateMapHTML(userLocation, places, routeData);

  // Cuando el usuario toca un marcador dentro del WebView, nos manda un mensaje
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress') {
        onMarkerPress(data.placeId);
      }
    } catch (e) {
      console.error('[LeafletMap] Error parseando mensaje:', e);
    }
  };

  return (
    <WebView
      style={styles.map}
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
