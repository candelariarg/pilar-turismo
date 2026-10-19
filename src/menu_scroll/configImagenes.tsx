import { ImageSourcePropType } from 'react-native';

//una linea por cada lugar
//en firebase se guarda una clave que coincide con el nombre de la imagen, ahi se relacionan
export const imagenesLugares: Record<string, ImageSourcePropType> = {
  parroquia: require('../../assets/images/lugaresIniciales/parroquia.jpg'),
  plaza: require('../../assets/images/lugaresIniciales/plaza.jpg'),
  capilla: require('../../assets/images/lugaresIniciales/capilla.jpg'),
  palacio: require('../../assets/images/lugaresIniciales/palacio.jpg'),
  teatro: require('../../assets/images/lugaresIniciales/teatro.jpg'),
  corredor: require('../../assets/images/lugaresIniciales/corredor.jpg'),
  cenotafio: require('../../assets/images/lugaresIniciales/cenotafio.jpg'),
  reserva: require('../../assets/images/lugaresIniciales/reserva.jpg'),
  biblioteca: require('../../assets/images/lugaresIniciales/biblioteca.jpg'),
  bingo: require('../../assets/images/lugaresIniciales/bingo.jpg'),
  colonial: require('../../assets/images/lugaresIniciales/colonial.jpg'),
  champagnat: require('../../assets/images/lugaresIniciales/champagnat.jpg'),
  granteatro: require('../../assets/images/lugaresIniciales/granteatro.jpg'),
  palmas: require('../../assets/images/lugaresIniciales/palmas.jpg'),
  torres: require('../../assets/images/lugaresIniciales/torres.jpg'),
  lions: require('../../assets/images/lugaresIniciales/lions.jpg'),
  aldea: require('../../assets/images/lugaresIniciales/aldea.jpg'),
  paseo: require('../../assets/images/lugaresIniciales/paseo.jpg'),
};

export const imagenPorDefecto: ImageSourcePropType = require('../../assets/images/lugaresIniciales/parroquia.jpg');