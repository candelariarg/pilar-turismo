// lugares de muestra 
interface Lugar {
  id: string;
  nombre: string;
  categoria: 'hospital' | 'comisaria' | 'supermercado' | 'sum' | 'turismo';
  categoriaText: string;
  icono: string;
  color: string;
  direccion: string;
  distancia: string;
  tiempo: string;
  coordenadasSimuladas: { top: number; left: number };
}

// datos de prueba para el jueves 
const LUGARES_PILAR: Lugar[] = [
  {
    id: '1',
    nombre: 'Hospital Central de Pilar',
    categoria: 'hospital',
    categoriaText: 'Hospital / Salud',
    icono: 'hospital-building',
    color: '#E53935',
    direccion: 'Panamericana Km 52.5, Pilar',
    distancia: '2.4 km',
    tiempo: '5 min',
    coordenadasSimuladas: { top: 32, left: 62 },
  },
  {
    id: '2',
    nombre: 'Hospital F. Sanguinetti',
    categoria: 'hospital',
    categoriaText: 'Hospital',
    icono: 'medical-bag',
    color: '#E53935',
    direccion: 'Víctor Vergani 850, Pilar',
    distancia: '1.1 km',
    tiempo: '3 min',
    coordenadasSimuladas: { top: 48, left: 42 },
  },
  {
    id: '3',
    nombre: 'Comisaría Pilar 1ª',
    categoria: 'comisaria',
    categoriaText: 'Comisaría / Seguridad',
    icono: 'shield-account',
    color: '#1E88E5',
    direccion: 'Tucumán 555, Pilar Centro',
    distancia: '0.8 km',
    tiempo: '2 min',
    coordenadasSimuladas: { top: 40, left: 48 },
  },
  {
    id: '4',
    nombre: 'SUM Centro Comunitario Pilar',
    categoria: 'sum',
    categoriaText: 'SUM / Centro Vecinal',
    icono: 'account-group',
    color: '#8E24AA',
    direccion: 'San Martín 120, Pilar',
    distancia: '1.5 km',
    tiempo: '4 min',
    coordenadasSimuladas: { top: 58, left: 55 },
  },
  {
    id: '5',
    nombre: 'Parroquia Ntra. Sra. del Pilar',
    categoria: 'turismo',
    categoriaText: 'Punto Turístico',
    icono: 'church',
    color: '#FB8C00',
    direccion: 'Plaza 12 de Octubre, Pilar',
    distancia: '0.5 km',
    tiempo: '1 min',
    coordenadasSimuladas: { top: 44, left: 38 },
  },
  {
    id: '6',
    nombre: 'Supermercado Carrefour Pilar',
    categoria: 'supermercado',
    categoriaText: 'Supermercado',
    icono: 'cart',
    color: '#43A047',
    direccion: 'Av. Tratado de Pilar 300',
    distancia: '2.0 km',
    tiempo: '6 min',
    coordenadasSimuladas: { top: 25, left: 30 },
  },
];

export { LUGARES_PILAR, Lugar };