/**
 * Reglas de validación compartidas por el login y el registro.
 *
 * Todas devuelven `null` cuando el valor está bien, o un mensaje
 * listo para mostrar cuando no. Así la pantalla no decide textos.
 */

/** Mínimo que exige Firebase Auth para las contraseñas. */
export const PASSWORD_MINIMO = 6;

/* Algo@algo.algo — suficiente para atajar errores de tipeo. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): string | null {
  const limpio = email.trim();
  if (!limpio) return "Ingresá tu email.";
  if (!EMAIL_RE.test(limpio)) return "El email no parece válido.";
  return null;
}

export function validarPassword(password: string): string | null {
  if (!password) return "Ingresá tu contraseña.";
  if (password.length < PASSWORD_MINIMO) {
    return `La contraseña necesita ${PASSWORD_MINIMO} caracteres o más.`;
  }
  return null;
}

export function validarConfirmacion(
  password: string,
  confirmacion: string,
): string | null {
  if (!confirmacion) return "Repetí tu contraseña.";
  if (password !== confirmacion) return "Las contraseñas no coinciden.";
  return null;
}

/** Saca el `code` de un error de Firebase sin usar `any`. */
export function codigoDeError(error: unknown): string {
  return (error as { code?: string }).code ?? "";
}

/** Traduce los códigos de Firebase Auth a mensajes en español. */
export function mensajeDeErrorFirebase(codigo: string): string {
  switch (codigo) {
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/invalid-credential":
      return "Email o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese email.";
    case "auth/weak-password":
      return `La contraseña necesita ${PASSWORD_MINIMO} caracteres o más.`;
    case "auth/too-many-requests":
      return "Demasiados intentos. Probá en unos minutos.";
    case "auth/network-request-failed":
      return "Sin conexión a internet.";
    case "auth/operation-not-allowed":
      return "El acceso con email y contraseña no está habilitado en Firebase (Authentication → Sign-in method).";
    case "auth/user-not-found":
      return "No existe una cuenta con ese email.";
    case "auth/unauthorized-continue-uri":
    case "auth/invalid-continue-uri":
      return "La URL de retorno del correo no está autorizada en Firebase.";
    default:
      return "Ocurrió un error. Intentá de nuevo.";
  }
}
