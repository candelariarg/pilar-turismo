import { Alert, Platform } from "react-native";

type Opciones = {
  titulo: string;
  mensaje: string;
  textoAceptar: string;
  textoCancelar: string;
};

/**
 * Pide confirmación al usuario y resuelve `true` si acepta.
 *
 * En web hay que usar `window.confirm`, porque `Alert.alert` de
 * react-native-web está implementado vacío y no muestra nada.
 */
export function confirmar({
  titulo,
  mensaje,
  textoAceptar,
  textoCancelar,
}: Opciones): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }

  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: textoCancelar,
          style: "cancel",
          onPress: () => resolver(false),
        },
        {
          text: textoAceptar,
          onPress: () => resolver(true),
        },
      ],
      // Si en Android se cierra tocando afuera, resolvemos `false`
      // para que la promesa no quede colgada para siempre.
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}
