import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, StyleProp, ViewStyle } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';

export type TabRouteName = 'index' | 'explore' | 'clima' | 'perfil';

const TAB_ORDER: TabRouteName[] = ['index', 'explore', 'clima', 'perfil'];

interface SwipeableScreenProps {
  children: React.ReactNode;
  currentTab: TabRouteName;
  style?: StyleProp<ViewStyle>;
}

export function SwipeableScreen({ children, currentTab, style }: SwipeableScreenProps) {
  const navigation = useNavigation<any>();
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  const goToTab = (target: TabRouteName) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    try {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate(target);
      } else {
        router.replace(target === 'index' ? '/' : `/${target}`);
      }
    } catch {
      router.replace(target === 'index' ? '/' : `/${target}`);
    }

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 400);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Solo capturamos si el movimiento es claramente horizontal
        // y mayor a 15px, permitiendo que el scroll vertical de FlatList fluya sin interferencias
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        const hasMovedEnough = Math.abs(gestureState.dx) > 15;
        return isHorizontal && hasMovedEnough;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, gestureState) => {
        const currentIndex = TAB_ORDER.indexOf(currentTab);
        if (currentIndex === -1) return;

        // Deslizamiento hacia la izquierda (dedo se mueve de derecha a izquierda) -> siguiente pestaña
        const isSwipeLeft =
          gestureState.dx < -40 || (gestureState.dx < -20 && gestureState.vx < -0.3);

        // Deslizamiento hacia la derecha (dedo se mueve de izquierda a derecha) -> pestaña anterior
        const isSwipeRight =
          gestureState.dx > 40 || (gestureState.dx > 20 && gestureState.vx > 0.3);

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
