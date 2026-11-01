import { StyleSheet } from "react-native";

/**
 * Estilos compartidos por las pantallas de autenticación (login y registro).
 * Si cambiás algo acá, cambia en las dos: es a propósito.
 */

/* Paleta: los mismos valores del header y la tab bar. */
export const AZUL = "#0068B3";
export const TEXTO = "#15232E";
export const SUAVE = "#6B7C89";
export const FONDO_INPUT = "#F4F7FA";
export const PELIGRO = "#D93025";

export const authStyles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: AZUL,
  },
  flex: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  /* Marca */
  marca: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  nombre: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  lema: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 4,
  },

  /* Tarjeta del formulario */
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    gap: 12,
    shadowColor: "#00223D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  titulo: {
    fontSize: 19,
    fontWeight: "700",
    color: TEXTO,
  },
  subtitulo: {
    fontSize: 13,
    color: SUAVE,
    marginTop: -6,
  },

  /* Campos */
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXTO,
    backgroundColor: FONDO_INPUT,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: PELIGRO,
  },
  textoError: {
    color: PELIGRO,
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: -6,
  },

  /* Botón principal */
  boton: {
    height: 52,
    borderRadius: 12,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AZUL,
  },
  botonDeshabilitado: {
    opacity: 0.65,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Enlace al pie */
  pie: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  pieEnlace: {
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
