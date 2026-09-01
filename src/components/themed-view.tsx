import { View, type ViewProps } from 'react-native';


import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'background' | 'text';
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: type === 'text' ? theme.text : theme.background }, style]} {...otherProps} />;
}
