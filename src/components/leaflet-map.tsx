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

const CARTO_API_KEY = process.env.EXPO_PUBLIC_CARTO_API_KEY || 'cb1_4ztx_1_6832a6a8b6de5c495632c45f';

// Genera la página HTML base con Leaflet y los scripts de renderizado dinámico
const generateBaseMapHTML = (userLocation: LocationCoords): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; background: #E8EAED; }
        .custom-marker { background: none !important; border: none !important; }

        /* Ocultar atribución nativa para ganar espacio visual limpio */
        .leaflet-control-attribution { display: none !important; }

        /* Botones de zoom flotantes estilo Google Maps (ubicados en el lateral derecho superior) */
        .zoom-controls {
          position: absolute;
          top: 135px;
          right: 16px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        .zoom-box {
          background: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .zoom-btn {
          width: 40px;
          height: 40px;
          background: #FFFFFF;
          border: none;
          font-size: 22px;
          font-weight: 400;
          color: #3C4043;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .zoom-btn:active { background: #F1F3F4; }
        .zoom-divider {
          width: 100%;
          height: 1px;
          background: #E8EAED;
        }

        /* Animación pulso de la ubicación del usuario */
        .user-pulse {
          width: 22px; height: 22px;
          background: rgba(26, 115, 232, 0.35);
          border-radius: 50%;
          animation: pulse 2s infinite ease-out;
        }
        .user-dot {
          width: 14px; height: 14px;
          background: #1A73E8;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          position: absolute;
          top: 4px; left: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.35);
        }
        @keyframes pulse {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <!-- Botonera de zoom -->
      <div class="zoom-controls">
        <div class="zoom-box">
          <button class="zoom-btn" id="zoomIn" ontouchend="zoomIn(event)">+</button>
          <div class="zoom-divider"></div>
          <button class="zoom-btn" id="zoomOut" ontouchend="zoomOut(event)">−</button>
        </div>
      </div>

      <script>
        var map = L.map('map', {
          zoomControl: false
        }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);
        window.map = map;

        // Capa de mapas moderna CartoDB Voyager con API Key oficial (5.000.000 peticiones/mes)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=' + '${CARTO_API_KEY}', {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        // Marcador del usuario (punto azul Google)
        var userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="position:relative;width:22px;height:22px;"><div class="user-pulse"></div><div class="user-dot"></div></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          }),
          zIndexOffset: 1000
        }).addTo(map);

        // Capas para marcadores y rutas dinámicas
        var placesLayer = L.layerGroup().addTo(map);
        var routeLayer = L.layerGroup().addTo(map);

        function getColor(cat) {
          switch (cat) {
            case 'hospital':    return '#E53935';
            case 'police':      return '#1E88E5';
            case 'supermarket': return '#43A047';
            case 'restaurant':  return '#FB8C00';
            case 'park':        return '#4CAF50';
            case 'tourism':     return '#8E24AA';
            default:            return '#5F6368';
          }
        }

        function getCategoryPath(cat, color) {
          switch (cat) {
            case 'hospital':
              return "<rect x='16' y='12' width='4' height='12' rx='1' fill='" + color + "'/>"
                   + "<rect x='12' y='16' width='12' height='4' rx='1' fill='" + color + "'/>";
            case 'police':
              return "<path d='M18 12 L22 14 v4 c0 3 -4 5 -4 5 s-4 -2 -4 -5 v-4 z' fill='" + color + "'/>";
            case 'supermarket':
              return "<path d='M13 14 h2 l1.5 5 h4.5 l1.5 -4 h-8' stroke='" + color + "' stroke-width='1.5' fill='none'/>"
                   + "<circle cx='16' cy='21' r='1' fill='" + color + "'/>"
                   + "<circle cx='20' cy='21' r='1' fill='" + color + "'/>";
            case 'restaurant':
              return "<path d='M14 12 v4 c0 1 1 2 2 2 v4 h1 v-4 c1 0 2 -1 2 -2 v-4 h-1 v3 h-1 v-3 h-1 v-3 z M21 12 v10 h1.5 v-5 c0 -2 -1.5 -3 -1.5 -5 z' fill='" + color + "'/>";
            case 'park':
              return "<path d='M18 12 L14 18 h2.5 L15 22 h6 L19.5 18 H22 Z' fill='" + color + "'/>";
            case 'tourism':
              return "<path d='M18 12 L19.5 16 h4.2 l-3.4 2.5 1.3 4 -3.6 -2.4 -3.6 2.4 1.3 -4 -3.4 -2.5 h4.2 z' fill='" + color + "'/>";
            default:
              return "<circle cx='18' cy='18' r='4' fill='" + color + "'/>";
          }
        }

        function makePinSVG(cat, size, isSel) {
          var color = getColor(cat);
          var iconContent = getCategoryPath(cat, color);
          var h = Math.round(size * 1.35);
          var stroke = isSel ? "stroke='#202124' stroke-width='2'" : "";
          return "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + h + "' viewBox='0 0 36 48'>"
            + "<filter id='sh-" + cat + (isSel ? "-sel" : "") + "'><feDropShadow dx='0' dy='2' stdDeviation='2.5' flood-opacity='0.45'/></filter>"
            + "<path d='M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 48 18 48 C18 48 36 31.5 36 18 C36 8.06 27.94 0 18 0Z' fill='" + color + "' filter='url(#sh-" + cat + (isSel ? "-sel" : "") + ")' " + stroke + "/>"
            + "<circle cx='18' cy='18' r='9' fill='white'/>"
            + iconContent
            + "</svg>";
        }

        function makeDestPinSVG() {
          return "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='60' viewBox='0 0 44 60'>"
            + "<filter id='ds'><feDropShadow dx='0' dy='3' stdDeviation='3' flood-opacity='0.45'/></filter>"
            + "<path d='M22 0 C9.85 0 0 9.85 0 22 C0 38.5 22 60 22 60 C22 60 44 38.5 44 22 C44 9.85 34.15 0 22 0Z' fill='#EA4335' filter='url(#ds)'/>"
            + "<circle cx='22' cy='22' r='10' fill='white'/>"
            + "<circle cx='22' cy='22' r='5' fill='#EA4335'/>"
            + "</svg>";
        }

        // Renderizado reactivo de marcadores sin recargar el WebView
        window.renderPlaces = function(placesData, selectedId) {
          placesLayer.clearLayers();
          if (!placesData || placesData.length === 0) return;
          var coords = [];
          placesData.forEach(function(p) {
            var isSel = (p.id === selectedId);
            var size = isSel ? 44 : 36;
            var h = isSel ? 60 : 49;
            var marker = L.marker([p.latitude, p.longitude], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: makePinSVG(p.category, size, isSel),
                iconSize: [size, h],
                iconAnchor: [size / 2, h]
              }),
              zIndexOffset: isSel ? 1500 : 0
            });
            // Al hacer clic, solo se avisa a React Native (sin globito HTML de Leaflet redundante)
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', placeId: p.id }));
            });
            placesLayer.addLayer(marker);
            coords.push([p.latitude, p.longitude]);
          });

          // Solo encuadra si no hay ruta activa
          if (routeLayer.getLayers().length === 0 && coords.length > 0) {
            if (coords.length > 1) {
              map.flyToBounds(L.latLngBounds(coords), {
                paddingTopLeft: [100, 40],
                paddingBottomRight: [40, 40],
                maxZoom: 16,
                minZoom: 13,
                duration: 1.0
              });
            } else {
              map.flyTo(coords[0], 16, { duration: 1.0 });
            }
          }
        };

        // Renderizado reactivo de ruta sin recargar el WebView
        window.renderRoute = function(routeData, destName) {
          routeLayer.clearLayers();
          if (!routeData || !routeData.coordinates || routeData.coordinates.length === 0) return;
          var coords = routeData.coordinates.map(function(c) { return [c.latitude, c.longitude]; });

          // Si es ruta de transporte público con pasos diferenciados
          if (routeData.transitSteps && routeData.transitSteps.length > 0) {
            routeData.transitSteps.forEach(function(step) {
              if (!step.coordinates || step.coordinates.length === 0) return;
              var stepCoords = step.coordinates.map(function(c) { return [c.latitude, c.longitude]; });

              if (step.type === 'walk') {
                // Tramo a pie: línea punteada moderna
                L.polyline(stepCoords, {
                  color: '#1A73E8',
                  weight: 5,
                  dashArray: '6, 8',
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(routeLayer);
              } else if (step.type === 'bus' || step.type === 'train') {
                var lineColor = step.color || '#2E7D32';

                // Halo exterior oscuro
                L.polyline(stepCoords, {
                  color: '#000000',
                  weight: 9,
                  opacity: 0.22,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(routeLayer);

                // Línea principal del transporte público
                L.polyline(stepCoords, {
                  color: lineColor,
                  weight: 6,
                  opacity: 1,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(routeLayer);

                // Marcador de parada de subida
                if (stepCoords.length > 0) {
                  var startPt = stepCoords[0];
                  var stopName = step.lineName || 'Colectivo';
                  L.marker(startPt, {
                    icon: L.divIcon({
                      className: 'custom-marker',
                      html: '<div style="background:' + lineColor + ';border:2px solid #FFF;border-radius:12px;padding:3px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;gap:4px;font-family:sans-serif;font-size:11px;font-weight:700;color:#FFF;white-space:nowrap;">🚌 ' + stopName + '</div>',
                      iconAnchor: [24, 12]
                    }),
                    zIndexOffset: 1200
                  }).addTo(routeLayer);

                  // Marcador de parada de descenso
                  var endPt = stepCoords[stepCoords.length - 1];
                  L.marker(endPt, {
                    icon: L.divIcon({
                      className: 'custom-marker',
                      html: '<div style="background:#5F6368;border:2px solid #FFF;border-radius:12px;padding:3px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;gap:4px;font-family:sans-serif;font-size:11px;font-weight:700;color:#FFF;white-space:nowrap;">🛑 Bajar aquí</div>',
                      iconAnchor: [24, 12]
                    }),
                    zIndexOffset: 1100
                  }).addTo(routeLayer);
                }
              }
            });
          } else {
            // Halo exterior azul oscuro
            L.polyline(coords, {
              color: '#0D47A1',
              weight: 9,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLayer);

            // Línea interior azul Google #1A73E8
            L.polyline(coords, {
              color: '#1A73E8',
              weight: 5,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLayer);
          }

          // Auto-encuadre con margen inferior para no tapar con el Bottom Sheet
          map.fitBounds(L.latLngBounds(coords), {
            paddingTopLeft: [70, 50],
            paddingBottomRight: [50, 320],
            maxZoom: 16,
            animate: true,
            duration: 1.0
          });
        };

        function zoomIn(e)  { e.preventDefault(); map.zoomIn();  }
        function zoomOut(e) { e.preventDefault(); map.zoomOut(); }

        // Avisar a React Native que el mapa está listo
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        }, 150);
      </script>
    </body>
    </html>
  `;
};

// ============================================================
// Componente principal LeafletMap
// ============================================================
export default function LeafletMap({
  userLocation,
  places,
  selectedPlace,
  routeData,
  onMarkerPress,
  centerOnUser,
}: LeafletMapProps) {

  const webViewRef = useRef<any>(null);
  const isMapReadyRef = useRef<boolean>(false);
  const initialHtmlRef = useRef<string>(generateBaseMapHTML(userLocation));

  // Sincroniza los marcadores por JavaScript sin recargar el WebView
  const syncPlaces = () => {
    if (!isMapReadyRef.current || !webViewRef.current) return;
    const js = `
      if (window.renderPlaces) {
        window.renderPlaces(${JSON.stringify(places)}, ${JSON.stringify(selectedPlace?.id || null)});
      }
      true;
    `;
    webViewRef.current.injectJavaScript(js);
  };

  // Sincroniza la ruta por JavaScript sin recargar el WebView
  const syncRoute = () => {
    if (!isMapReadyRef.current || !webViewRef.current) return;
    const js = `
      if (window.renderRoute) {
        window.renderRoute(${JSON.stringify(routeData)}, ${JSON.stringify(selectedPlace?.name || 'Destino')});
      }
      true;
    `;
    webViewRef.current.injectJavaScript(js);
  };

  useEffect(() => {
    syncPlaces();
  }, [places, selectedPlace]);

  useEffect(() => {
    syncRoute();
  }, [routeData, selectedPlace]);

  // Escucha el contador de re-centro al usuario
  useEffect(() => {
    if (centerOnUser && centerOnUser > 0 && webViewRef.current) {
      const js = `
        if (window.map) {
          window.map.flyTo([${userLocation.latitude}, ${userLocation.longitude}], 15, { duration: 1.0 });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [centerOnUser]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        isMapReadyRef.current = true;
        syncPlaces();
        syncRoute();
      } else if (data.type === 'markerPress') {
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
      source={{ html: initialHtmlRef.current }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
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
