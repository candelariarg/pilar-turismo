import React, { useEffect, useState } from 'react';
import {Text,ActivityIndicator,StyleSheet,View,ScrollView,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// INTERFACES DE TYPESCRIPT
//Definen la estructura exacta de los datos para evitar errores de tipo
interface PronosticoHora {
  hora: string;
  temp: number;
}

interface PronosticoDia {
  dia: string;
  max: number;
  min: number;
  probLluvia: number;
  estadoTexto: string;
}

interface ClimaData {
  temperatura: number;
  sensacion: number;
  tempMax: number;
  tempMin: number;
  viento: number;
  horas: PronosticoHora[];
  dias: PronosticoDia[];
}

export default function ClimaScreen() {
  // Estado principal del clima y del indicador de carga (spinner)
  const [clima, setClima] = useState<ClimaData | null>(null);
  const [cargando, setCargando] = useState(true);

  // Coordenadas geográficas fijas del Partido de Pilar
  const latitud = -34.2728;
  const longitud = -58.9142;

  // Ejecuta la petición del clima al montar el componente por primera vez
  useEffect(() => {
    obtenerClimaCompleto();
  }, []);

  // Función principal para consultar la API de Open-Meteo
  const obtenerClimaCompleto = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,apparent_temperature,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos.current && datos.hourly && datos.daily) {
        // Filtrar las próximas 7 horas a partir de la hora actual
        const horaActualIdx = new Date().getHours();
        const proximasHoras: PronosticoHora[] = [];
        for (let i = horaActualIdx; i < horaActualIdx + 7; i++) {
          if (datos.hourly.time[i]) {
            const fechaHora = new Date(datos.hourly.time[i]);
            const horaStr = `${fechaHora
              .getHours()
              .toString()
              .padStart(2, '0')}:00`;
            proximasHoras.push({
              hora: horaStr,
              temp: Math.round(datos.hourly.temperature_2m[i]),
            });
          }
        }

        // Función helper para traducir los códigos WMO de la API a texto en español
        const obtenerTextoEstado = (codigo: number, probLluvia: number): string => {
          if (codigo >= 51 && codigo <= 99) return `Lluvia ${probLluvia}%`;
          if (probLluvia > 60) return `Lluvia ${probLluvia}%`;
          if (codigo === 0) return 'Soleado';
          if (codigo === 1 || codigo === 2) return 'Parcialmente nublado';
          if (codigo === 3) return 'Nublado';
          if (codigo >= 45 && codigo <= 48) return 'Niebla';
          return 'Soleado';
        };

        //  Mapear y formatear los días de la semana (semana completa)
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const proximosDias: PronosticoDia[] = datos.daily.time.map(
          (fechaStr: string, idx: number) => {
            const d = new Date(`${fechaStr}T00:00:00`);
            const prob = datos.daily.precipitation_probability_max[idx] || 0;
            const codigo = datos.daily.weather_code[idx] || 0;

            return {
              dia: idx === 0 ? 'Hoy' : diasSemana[d.getDay()],
              max: Math.round(datos.daily.temperature_2m_max[idx]),
              min: Math.round(datos.daily.temperature_2m_min[idx]),
              probLluvia: prob,
              estadoTexto: obtenerTextoEstado(codigo, prob),
            };
          }
        );

        // Actualizar el estado con toda la información
        setClima({
          temperatura: Math.round(datos.current.temperature_2m),
          sensacion: Math.round(datos.current.apparent_temperature),
          tempMax: Math.round(datos.daily.temperature_2m_max[0]),
          tempMin: Math.round(datos.daily.temperature_2m_min[0]),
          viento: Math.round(datos.current.wind_speed_10m),
          horas: proximasHoras,
          dias: proximosDias,
        });
      }
    } catch (error) {
      console.error('Error al obtener el clima:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        {cargando ? (
          // Vista de carga mientras responde la API
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          // Contenido principal desplegable
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cabecera de Pilar y temperatura actual */}
            <View style={styles.header}>
              <View style={styles.badgePilar}>
                <Text style={styles.badgeTexto}>PILAR TURISMO</Text>
              </View>

              <Text style={styles.ciudad}>Pilar, Buenos Aires</Text>

              <Text style={styles.temperatura}>
                {clima ? `${clima.temperatura}°C` : '--'}
              </Text>

              {clima && (
                <Text style={styles.rangos}>
                  Máx. {clima.tempMax}°  •  Mín. {clima.tempMin}°  •  Sensación: {clima.sensacion}°
                </Text>
              )}
            </View>

            {/* Pronóstico por hora (horizontal) */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>PRONÓSTICO POR HORA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.horasRow}>
                  {clima?.horas.map((item, index) => (
                    <View key={index} style={styles.horaItem}>
                      <Text style={styles.horaTexto}>{item.hora}</Text>
                      <Text style={styles.horaTemp}>{item.temp}°</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Pronóstico semanal de 7 Días */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>PRONÓSTICO DE 7 DÍAS</Text>
              {clima?.dias.map((item, index) => (
                <View key={index} style={styles.diaRow}>
                  <Text style={styles.diaNombre}>{item.dia}</Text>

                  <Text
                    style={
                      item.probLluvia > 60
                        ? styles.textoLluvia
                        : styles.textoNormal
                    }
                  >
                    {item.estadoTexto}
                  </Text>

                  <View style={styles.diaRangoContainer}>
                    <Text style={styles.diaMin}>{item.min}°</Text>
                    <Text style={styles.diaMax}>{item.max}°</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Métricas adicionales (Viento y Sensación Térmica) */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
              <View style={styles.detallesGrid}>
                <View style={styles.detalleCard}>
                  <Text style={styles.detalleLabel}>VIENTO</Text>
                  <Text style={styles.detalleVal}>{clima?.viento} km/h</Text>
                </View>
                <View style={styles.detalleCard}>
                  <Text style={styles.detalleLabel}>SENSACIÓN TÉRMICA</Text>
                  <Text style={styles.detalleVal}>{clima?.sensacion}°C</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1E88E5', 
  },
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  badgePilar: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ciudad: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  temperatura: {
    fontSize: 68,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  rangos: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  horasRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 4,
  },
  horaItem: {
    alignItems: 'center',
    width: 45,
  },
  horaTexto: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  horaTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  diaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  diaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 50,
  },
  textoNormal: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    textAlign: 'center',
  },
  textoLluvia: {
    fontSize: 13,
    color: '#E0F2FE',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  diaRangoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  diaMin: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  diaMax: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detallesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detalleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  detalleLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '800',
    marginBottom: 4,
  },
  detalleVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});