import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    background: isDark ? '#151718' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#11181C',
  };
}
