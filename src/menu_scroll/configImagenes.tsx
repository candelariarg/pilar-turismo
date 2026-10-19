import { ImageSourcePropType } from 'react-native';

//una linea por cada lugar
//en firebase se guarda una clave que coincide con el nombre de la imagen, ahi se relacionan
export const imagenesLugares: Record<string, ImageSourcePropType> = {
  parroquia: require('../../assets/images/lugaresIniciales/parroquia.jpeg'),
  plaza: require('../../assets/images/lugaresIniciales/plaza.jpeg'),
  capilla: require('../../assets/images/lugaresIniciales/capilla.jpeg'),
  palacio: require('../../assets/images/lugaresIniciales/palacio.jpeg'),
  teatro: require('../../assets/images/lugaresIniciales/teatro.jpeg'),
  corredor: require('../../assets/images/lugaresIniciales/corredor.jpeg'),
  cenotafio: require('../../assets/images/lugaresIniciales/cenotafio.jpeg'),
  reserva: require('../../assets/images/lugaresIniciales/reserva.jpeg'),
  biblioteca: require('../../assets/images/lugaresIniciales/biblioteca.jpeg'),
  bingo: require('../../assets/images/lugaresIniciales/bingo.jpeg'),
  colonial: require('../../assets/images/lugaresIniciales/colonial.jpeg'),
  champagnat: require('../../assets/images/lugaresIniciales/champagnat.jpeg'),
  granteatro: require('../../assets/images/lugaresIniciales/granteatro.jpeg'),
  palmas: require('../../assets/images/lugaresIniciales/palmas.jpeg'),
  torres: require('../../assets/images/lugaresIniciales/torres.jpeg'),
  lions: require('../../assets/images/lugaresIniciales/lions.jpeg'),
  aldea: require('../../assets/images/lugaresIniciales/aldea.jpeg'),
  paseo: require('../../assets/images/lugaresIniciales/paseo.jpeg'),
};

export const imagenPorDefecto: ImageSourcePropType = require('../../assets/images/lugaresIniciales/parroquia');