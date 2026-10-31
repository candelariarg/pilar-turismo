import { Image, StyleSheet, Text, View } from 'react-native';

export function AppHeader() {
  return (
    <View style={styles.barra}>
      <Image
        source={require('@/assets/images/logos/logoapp.jpg')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="PaseAR"
      />
      <View>
        <Text style={styles.titulo}>PaseAR</Text>
        <Text style={styles.subtitulo}>Descubrí la ciudad</Text>
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