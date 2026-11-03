import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

export type TabRouteName = 'index' | 'mapa' | 'clima' | 'perfil';

const TAB_ORDER: TabRouteName[] = ['index', 'mapa', 'clima', 'perfil'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Zona de borde (píxeles desde el marco izquierdo o derecho de la pantalla)
const EDGE_ZONE = 45;

interface SwipeableScreenProps {
  children: React.ReactNode;
  currentTab: TabRouteName;
  style?: StyleProp<ViewStyle>;
}

export function SwipeableScreen({ children, currentTab, style }: SwipeableScreenProps) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  const goToTab = (target: TabRouteName) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    router.replace(target === 'index' ? '/' : `/${target}`);

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 400);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // En la pantalla de Mapa: aplicamos Solución 1 (Edge Swipe)
        // El gesto DEBE haber comenzado en los primeros 45px del borde izquierdo o derecho.
        // Si el toque empezó en el centro del mapa, se ignora completamente para que el usuario mueva las calles.
        if (currentTab === 'mapa') {
          const startsAtEdge =
            gestureState.x0 < EDGE_ZONE || gestureState.x0 > SCREEN_WIDTH - EDGE_ZONE;
          if (!startsAtEdge) {
            return false;
          }
        }

        // Movimiento claramente horizontal para no colisionar con scrolls verticales
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        const minMove = currentTab === 'mapa' ? 20 : 15;
        const hasMovedEnough = Math.abs(gestureState.dx) > minMove;

        return isHorizontal && hasMovedEnough;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, gestureState) => {
        const currentIndex = TAB_ORDER.indexOf(currentTab);
        if (currentIndex === -1) return;

        // En la pantalla de Mapa: aplicamos Solución 3 (Flick rápido e intencional)
        // Se exige mayor velocidad y recorrido para evitar cualquier cambio accidental
        const minDistance = currentTab === 'mapa' ? 60 : 40;
        const minVelocity = currentTab === 'mapa' ? 0.45 : 0.3;

        // Deslizamiento hacia la izquierda (dedo hacia la izquierda) -> siguiente pestaña
        const isSwipeLeft =
          gestureState.dx < -minDistance ||
          (gestureState.dx < -25 && gestureState.vx < -minVelocity);

        // Deslizamiento hacia la derecha (dedo hacia la derecha) -> pestaña anterior
        const isSwipeRight =
          gestureState.dx > minDistance ||
          (gestureState.dx > 25 && gestureState.vx > minVelocity);

        if (isSwipeLeft && currentIndex < TAB_ORDER.length - 1) {
          goToTab(TAB_ORDER[currentIndex + 1]);
        } else if (isSwipeRight && currentIndex > 0) {
          goToTab(TAB_ORDER[currentIndex - 1]);
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
