import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationCoords, Place, RouteData } from '../servicios/map/type';

interface LeafletMapProps {
  userLocation: LocationCoords;
  places: Place[];
  selectedPlace?: Place | null;
  routeData: RouteData | null;
  onMarkerPress: (placeId: string) => void;
  centerOnUser?: number; // incrementar este valor dispara el re-centro hacia el GPS
}

// Esta función genera todo el HTML + CSS + JavaScript del mapa Leaflet
// Se ejecuta dentro de un WebView (como una mini página web dentro de la app)
const generateMapHTML = (
  userLocation: LocationCoords,
  places: Place[],
  routeData: RouteData | null,
  selectedPlace?: Place | null
): string => {

  // ============================================================
  // Funciones para definir color y emoji según la categoría del lugar
  // ============================================================
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
  // ============================================================

  // ============================================================
  // Generación dinámica de los marcadores en código JavaScript para Leaflet
  // ============================================================
  const markersJS = places.map((p) => {
    const color = getColor(p.category);
    const emoji = getEmoji(p.category);
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
  // ============================================================

  // ============================================================
  // Trazado de ruta visual estilo Waze/Google Maps + Pin de llegada animado + Auto-encuadre fitBounds
  // ============================================================
  const safeDestName = selectedPlace ? selectedPlace.name.replace(/'/g, "\\'") : 'Punto de llegada';
  const routeJS = (routeData && routeData.coordinates && routeData.coordinates.length > 0)
    ? `
      (function() {
        var routeCoords = [${routeData.coordinates.map(c => `[${c.latitude},${c.longitude}]`).join(',')}];

        // 1. Línea exterior (halo oscuro de contraste, estilo Waze / Google Maps)
        var routeBorder = L.polyline(routeCoords, {
          color: '#0D47A1',
          weight: 9,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // 2. Línea interior (azul vibrante que resalta sobre las calles)
        var routeCore = L.polyline(routeCoords, {
          color: '#00B0FF',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // 3. Pin de llegada destacado con animación de pulso y rebote
        var destCoord = routeCoords[routeCoords.length - 1];
        var destIcon = L.divIcon({
          className: 'dest-marker',
          html: '<div class="dest-marker-container"><div class="dest-pulse"></div><div class="dest-badge">🏁</div></div>',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        L.marker(destCoord, { icon: destIcon, zIndexOffset: 2500 })
          .addTo(map)
          .bindPopup('<b>🎯 Destino: ${safeDestName}</b>');

        // 4. Auto-encuadre inteligente (fitBounds) con margen inferior para no tapar la ruta con la tarjeta de información
        var bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, {
          paddingTopLeft: [50, 50],
          paddingBottomRight: [50, 260],
          maxZoom: 16,
          animate: true,
          duration: 1.0
        });
      })();
    `
    : '';
  // ============================================================

  // ============================================================
  // Auto-encuadre fluido para resultados de búsqueda y filtros
  // Limita el alejamiento mínimo (minZoom: 13) para evitar descargas pesadas y mantener fluidez
  // ============================================================
  const placesBoundsJS = (!routeData && places && places.length > 0)
    ? `
      (function() {
        var coords = [${places.map(p => `[${p.latitude},${p.longitude}]`).join(',')}];
        if (coords.length > 1) {
          var bounds = L.latLngBounds(coords);
          map.flyToBounds(bounds, {
            paddingTopLeft: [80, 40],
            paddingBottomRight: [40, 40],
            maxZoom: 16,
            minZoom: 13,
            duration: 1.0
          });
        } else if (coords.length === 1) {
          map.flyTo(coords[0], 16, { duration: 1.0 });
        }
      })();
    `
    : '';
  // ============================================================

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .custom-marker { background: none !important; border: none !important; }
        
        /* Animación ubicación usuario */
        .user-pulse {
          width: 20px; height: 20px;
          background: rgba(33, 150, 243, 0.35);
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

        /* Pin animado de llegada / destino */
        .dest-marker {
          background: none !important;
          border: none !important;
        }
        .dest-marker-container {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dest-pulse {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(233, 30, 99, 0.4);
          animation: destPulse 1.8s infinite ease-out;
        }
        .dest-badge {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF1744, #D50000);
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          animation: destBounce 1.2s infinite alternate ease-in-out;
          z-index: 2;
        }
        @keyframes destPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes destBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false
        }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);

        // ============================================================
        // Capa de mapas moderna estilo Humanitarian OSM (colores pastel y sin API key)
        // ============================================================
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OpenStreetMap Team',
          subdomains: 'abc',
          maxZoom: 19
        }).addTo(map);
        // ============================================================

        // Marcador del usuario (punto azul con pulsación)
        L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="position:relative;width:20px;height:20px;"><div class="user-pulse"></div><div class="user-dot"></div></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }),
          zIndexOffset: 1000
        }).addTo(map).bindPopup('📍 Tu ubicación');

        // Marcadores de los lugares turísticos
        ${markersJS}

        // Auto-encuadre fluido para búsquedas y filtros
        ${placesBoundsJS}

        // Trazado de ruta + pin animado + fitBounds automático
        ${routeJS}
      </script>
    </body>
    </html>
  `;
};

// ============================================================
// Componente principal LeafletMap que renderiza el mapa dentro de un WebView
// ============================================================
export default function LeafletMap({ userLocation, places, selectedPlace, routeData, onMarkerPress, centerOnUser }: LeafletMapProps) {

  const webViewRef = useRef<any>(null);
  const htmlContent = generateMapHTML(userLocation, places, routeData, selectedPlace);

  // ============================================================
  // Efecto que escucha el contador centerOnUser y vuela de vuelta al GPS del usuario
  // ============================================================
  useEffect(() => {
    if (centerOnUser && centerOnUser > 0 && webViewRef.current) {
      const js = `
        map.flyTo([${userLocation.latitude}, ${userLocation.longitude}], 15, { duration: 1.0 });
        true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [centerOnUser]);
  // ============================================================

  // Comunicación WebView -> React Native cuando el usuario toca un marcador
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
      ref={webViewRef}
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
// ============================================================

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
