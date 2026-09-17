declare module 'expo-symbols' {
  export type SymbolWeight = 'thin' | 'ultraLight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  export interface SymbolViewProps {
    name: string;
    weight?: SymbolWeight;
    tintColor?: string;
    resizeMode?: string;
    style?: any;
  }
  export const SymbolView: any;
}

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
    Soft = 'soft',
    Rigid = 'rigid',
  }
  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function selectionAsync(): Promise<void>;
  export function notificationAsync(type?: any): Promise<void>;
}

declare module 'expo-router' {
  export type Href = string | object;
  export const Tabs: any;
  export const Link: any;
  export const useRouter: any;
  export const useLocalSearchParams: any;
  export const SplashScreen: any;
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function collection(db: any, path: string, ...pathSegments: string[]): any;
  export function doc(db: any, path: string, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<any>;
  export function getDoc(docRef: any): Promise<any>;
  export function setDoc(docRef: any, data: any, options?: any): Promise<any>;
  export function addDoc(collectionRef: any, data: any): Promise<any>;
  export function updateDoc(docRef: any, data: any): Promise<any>;
  export function deleteDoc(docRef: any): Promise<any>;
}

declare module 'react-native-reanimated' {
  export namespace Animated {
    export type ScrollView = any;
  }
  const Animated: any;
  export default Animated;
  export function interpolate(...args: any[]): any;
  export function useAnimatedRef(...args: any[]): any;
  export function useAnimatedStyle(...args: any[]): any;
  export function useScrollViewOffset(...args: any[]): any;
  export function useSharedValue(...args: any[]): any;
  export function withTiming(...args: any[]): any;
  export function withSpring(...args: any[]): any;
  export function withSequence(...args: any[]): any;
  export function withRepeat(...args: any[]): any;
}
