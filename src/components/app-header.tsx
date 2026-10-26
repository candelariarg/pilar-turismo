import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.barra}>
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Pilar Turismo"
      />
      <View>
        <Text style={styles.titulo}>Pilar Turismo</Text>
        <Text style={styles.subtitulo}>{t('header.subtitle')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',   // logo y texto uno al lado del otro
    alignItems: 'center',   // centrado vertical
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0068B3', // el mismo azul de tu tab bar
  },
  logo: { width: 40, height: 40 },
  titulo: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subtitulo: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});
