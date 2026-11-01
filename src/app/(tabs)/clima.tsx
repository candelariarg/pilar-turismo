import React, { useEffect, useState } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/src/components/app-header';
import { Ionicons } from '@expo/vector-icons';

// INTERFACES DE TYPESCRIPT
// Definen la estructura exacta de los datos para evitar errores de tipo
interface PronosticoHora {
  hora: string;
  temp: number;
}

interface PronosticoDia {
  dia: string;
  diaKey: string;
  max: number;
  min: number;
  probLluvia: number;
  codigoClima: number;
  estadoTexto: string;
}

interface RecomendacionDia {
  tipo: 'soleado' | 'nublado' | 'lluvioso';
  tituloPrincipal: string;
  subtitulo: string;
  actividades: {
    titulo: string;
    descripcion: string;
    lugar: string;
  }[];
}

interface ClimaData {
  temperatura: number;
  sensacion: number;
  tempMax: number;
  tempMin: number;
  viento: number;
  horas: PronosticoHora[];
  dias: PronosticoDia[];
  recomendacion: RecomendacionDia;
}

const diasSemanaKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export default function ClimaScreen() {
  const { t } = useTranslation();

  // Estado principal del clima y del indicador de carga (spinner)
  const [clima, setClima] = useState<ClimaData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const latitud = -34.2728;
  const longitud = -58.9142;

  useEffect(() => {
    obtenerClimaCompleto();
  }, []);

  // Función helper para traducir los códigos WMO de la API
  const obtenerTextoEstado = (codigo: number, probLluvia: number): string => {
    if (codigo >= 51 && codigo <= 99) return `${t('weather.conditions.rain')} ${probLluvia}%`;
    if (probLluvia > 60) return `${t('weather.conditions.rain')} ${probLluvia}%`;
    if (codigo === 0) return t('weather.conditions.sunny');
    if (codigo === 1 || codigo === 2) return t('weather.conditions.partlyCloudy');
    if (codigo === 3) return t('weather.conditions.cloudy');
    if (codigo >= 45 && codigo <= 48) return t('weather.conditions.fog');
    return t('weather.conditions.sunny');
  };

    // Recomendaciones atractivas orientadas al turismo con los lugares de Pilar
  const generarRecomendaciones = (
    probLluvia: number,
    codigoWmo: number
  ): RecomendacionDia => {
    const estaLloviendo = codigoWmo >= 51 && codigoWmo <= 99;
    const estaNublado = [1, 2, 3, 45, 48].includes(codigoWmo);

    if (estaLloviendo) {
      return {
        tipo: 'lluvioso',
        tituloPrincipal: t('weather.recommendations.rainy.title'),
        subtitulo: t('weather.recommendations.rainy.subtitle'),
        actividades: [
          {
            titulo: t('weather.recommendations.rainy.act1Title'),
            descripcion: t('weather.recommendations.rainy.act1Desc'),
            lugar: 'Palmas del Pilar / Torres del Sol',
          },
          {
            titulo: t('weather.recommendations.rainy.act2Title'),
            descripcion: t('weather.recommendations.rainy.act2Desc'),
            lugar: 'Teatro Gran Pilar / Bingo Oasis',
          },
          {
            titulo: t('weather.recommendations.rainy.act3Title'),
            descripcion: t('weather.recommendations.rainy.act3Desc'),
            lugar: 'Colonial / La Aldea',
          },
        ],
      };
    }

    if (estaNublado || probLluvia > 50) {
      return {
        tipo: 'nublado',
        tituloPrincipal: t('weather.recommendations.cloudy.title'),
        subtitulo: t('weather.recommendations.cloudy.subtitle'),
        actividades: [
          {
            titulo: t('weather.recommendations.cloudy.act1Title'),
            descripcion: t('weather.recommendations.cloudy.act1Desc'),
            lugar: 'Paseo Champagnat',
          },
          {
            titulo: t('weather.recommendations.cloudy.act2Title'),
            descripcion: t('weather.recommendations.cloudy.act2Desc'),
            lugar: 'La Aldea / Colonial',
          },
        ],
      };
    }

    return {
      tipo: 'soleado',
      tituloPrincipal: t('weather.recommendations.sunny.title'),
      subtitulo: t('weather.recommendations.sunny.subtitle'),
      actividades: [
        {
          titulo: t('weather.recommendations.sunny.act1Title'),
          descripcion: t('weather.recommendations.sunny.act1Desc'),
          lugar: 'Plaza 12 de Octubre',
        },
        {
          titulo: t('weather.recommendations.sunny.act2Title'),
          descripcion: t('weather.recommendations.sunny.act2Desc'),
          lugar: 'Reserva Natural de Pilar',
        },
        {
          titulo: t('weather.recommendations.sunny.act3Title'),
          descripcion: t('weather.recommendations.sunny.act3Desc'),
          lugar: 'Lions 1987 / Paseo Champagnat',
        },
      ],
    };
  };

  // Función principal para consultar la API de Open-Meteo
  const obtenerClimaCompleto = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,apparent_temperature,wind_speed_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();

      if (datos.current && datos.hourly && datos.daily) {
        const horaActualIdx = new Date().getHours();
        const proximasHoras: PronosticoHora[] = [];
        for (let i = horaActualIdx; i < horaActualIdx + 7; i++) {
          if (datos.hourly.time[i]) {
            const fechaHora = new Date(datos.hourly.time[i]);
            const horaStr = `${fechaHora.getHours().toString().padStart(2, '0')}:00`;
            proximasHoras.push({
              hora: horaStr,
              temp: Math.round(datos.hourly.temperature_2m[i]),
            });
          }
        }

        // Mapear y formatear los días de la semana
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const proximosDias: PronosticoDia[] = datos.daily.time.map(
          (fechaStr: string, idx: number) => {
            const [year, month, day] = fechaStr.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            const prob = datos.daily.precipitation_probability_max[idx] || 0;
            const codigo = datos.daily.weather_code[idx] || 0;
            const diaKey = idx === 0 ? 'today' : diasSemanaKeys[d.getDay()];

            return {
              dia: idx === 0 ? 'Hoy' : diasSemana[d.getDay()],
              diaKey,
              max: Math.round(datos.daily.temperature_2m_max[idx]),
              min: Math.round(datos.daily.temperature_2m_min[idx]),
              probLluvia: prob,
              codigoClima: codigo,
              estadoTexto: obtenerTextoEstado(codigo, prob),
            };
          }
        );

        const recomendacion = generarRecomendaciones(
          datos.daily.precipitation_probability_max[0] ?? 0,
          datos.daily.weather_code[0] ?? 0
        );

        setClima({
          temperatura: Math.round(datos.current.temperature_2m),
          sensacion: Math.round(datos.current.apparent_temperature),
          tempMax: Math.round(datos.daily.temperature_2m_max[0]),
          tempMin: Math.round(datos.daily.temperature_2m_min[0]),
          viento: Math.round(datos.current.wind_speed_10m),
          horas: proximasHoras,
          dias: proximosDias,
          recomendacion: recomendacion,
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
        <AppHeader />
        
        <TouchableOpacity
         style={styles.botonRecomendaciones}
         onPress={() => setModalVisible(true)}
          >
         {/* Ícono de destellos / varita mágica */}
         <Ionicons name="map" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
  
         <Text style={styles.textoBoton}>{t('weather.viewRecommendations')}</Text>
        </TouchableOpacity>
        {cargando ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#1b7ed4" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cabecera con fondo azul y textos blancos */}
            <View style={styles.headerCard}>
              <View style={styles.badgePilar}>
                <Text style={styles.badgeTexto}>PaseAR</Text>
              </View>

              <Text style={styles.ciudad}>{t('weather.city', 'Pilar, Buenos Aires')}</Text>

              <Text style={styles.temperatura}>
                {clima ? `${clima.temperatura}°C` : '--'}
              </Text>

              {clima && (
                <Text style={styles.rangos}>
                  {t('weather.max')} {clima.tempMax}°  •  {t('weather.min')} {clima.tempMin}°  •  {t('weather.feelsLikeText')}: {clima.sensacion}°
                </Text>
              )}
            </View>

            {/* Pronóstico por hora */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>{t('weather.hourlyForecast')}</Text>
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

            {/* Pronóstico de 7 Días */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>{t('weather.dailyForecast')}</Text>
              {clima?.dias.map((item, index) => (
                <View key={index} style={styles.diaRow}>
                  <Text style={styles.diaNombre}>
                    {item.diaKey === 'today' ? t('weather.today') : t(`weather.days.${item.diaKey}`, item.dia)}
                  </Text>

                  <Text
                    style={
                      item.probLluvia > 60
                        ? styles.textoLluvia
                        : styles.textoNormal
                    }
                  >
                    {obtenerTextoEstado(item.codigoClima, item.probLluvia)}
                  </Text>

                  <View style={styles.diaRangoContainer}>
                    <Text style={styles.diaMin}>{item.min}°</Text>
                    <Text style={styles.diaMax}>{item.max}°</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Información adicional */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>{t('weather.additionalInfo')}</Text>
              <View style={styles.detallesGrid}>
                <View style={styles.detalleCard}>
                  <Text style={styles.detalleLabel}>{t('weather.windLabel')}</Text>
                  <Text style={styles.detalleVal}>{clima?.viento} km/h</Text>
                </View>
                <View style={styles.detalleCard}>
                  <Text style={styles.detalleLabel}>{t('weather.feelsLikeLabel')}</Text>
                  <Text style={styles.detalleVal}>{clima?.sensacion}°C</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Modal de Recomendaciones */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{t('weather.recommendationsTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContenido}>
              {(() => {
                const rec = clima?.dias[0] ? generarRecomendaciones(clima.dias[0].probLluvia, clima.dias[0].codigoClima) : clima?.recomendacion;
                if (!rec) return null;
                return (
                <>
                  <Text style={styles.tituloPrincipal}>
                    {rec.tituloPrincipal}
                  </Text>

                  <Text style={styles.subtituloModal}>
                    {rec.subtitulo}
                  </Text>

                 {rec.actividades.map((actividad, index) => (
                <View key={index} style={styles.actividadCard}>
    
              {/* 1. Contenedor horizontal SOLO para el ícono + lugar */}
             <View style={styles.lugarContainer}>
             <Ionicons name="location-sharp" size={15} color="#1E88E5" style={{ marginRight: 4 }} />
                <Text style={styles.actividadLugar}>
                {actividad.lugar}
                </Text>
              </View>

              {/* 2. Título (va suelto abajo) */}
                <Text style={styles.actividadTitulo}>
                 {actividad.titulo}
                </Text>

              {/* 3. Descripción (va suelta abajo) */}
                <Text style={styles.actividadDescripcion}>
                {actividad.descripcion}
                </Text>

              </View>
              ))}
                </>);
              })()}

              {/* Botón de cerrar ubicado abajo  */}
              <TouchableOpacity
                style={styles.botonCerrarInferior}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoBotonCerrar}>{t('common.close')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    </View>
  );
}

// ESTILOS CON FONDO BLANCO Y TARJETAS AZULES
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo general blanco
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
  headerCard: {
    alignItems: 'center',
    backgroundColor: '#1E88E5', // Tarjeta principal azul corporativo
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#1E88E5', // Fondo azul para Pronóstico por hora y 7 días
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF', // Blanco para que resalte sobre el fondo azul
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
    color: 'rgba(255, 255, 255, 0.8)', // Blanco claro
    marginBottom: 6,
  },
  horaTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // Blanco
  },
  diaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)', // Línea divisoria 
  },
  diaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF', // Blanco
    width: 50,
  },
  textoNormal: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    textAlign: 'center',
  },
  textoLluvia: {
    fontSize: 13,
    color: '#E0F2FE', // Celeste muy claro/blanco para el texto de lluvia
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D0E8FF',
  },
  detalleLabel: {
    fontSize: 10,
    color: '#1E88E5',
    fontWeight: '800',
    marginBottom: 4,
  },
  detalleVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  // Botón superior de recomendaciones
  botonRecomendaciones: {
    backgroundColor: '#1E88E5',
    flexDirection: 'row',       // <--- Alinea el ícono y el texto en la misma línea
    justifyContent: 'center',   // <--- Centra horizontalmente todo el contenido
    alignItems: 'center',       // <--- Centra verticalmente el ícono con las letras
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,           // <--- Estilo cápsula/píldora
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Modal estilizaciones
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    padding: 20,
    backgroundColor: '#2382d6',
    alignItems: 'center',
  },
  modalTitulo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContenido: {
    padding: 20,
    paddingBottom: 40,
  },
  tituloPrincipal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3596eb',
    marginBottom: 8,
  },
  subtituloModal: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 20,
    lineHeight: 20,
  },
  actividadCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  lugarContainer: {
    flexDirection: 'row', // Pon el ícono y el texto en la misma línea
    alignItems: 'center',  // Los alinea verticalmente al centro
    marginBottom: 4,      // Separa el lugar del título
  },
  
  actividadLugar: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3596eb',
    marginBottom: 6,
  },
  actividadTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  actividadDescripcion: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 18,
  },
  
  // Botón inferior para cerrar el modal
  botonCerrarInferior: {
    backgroundColor: '#1E88E5',
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
