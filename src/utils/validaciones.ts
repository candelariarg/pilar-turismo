/**
 * Reglas de validación compartidas por el login y el registro con soporte de traducción i18n.
 */

export const PASSWORD_MINIMO = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string, t?: (key: string, options?: any) => string): string | null {
  const limpio = email.trim();
  if (!limpio) return t ? t('validation.emailRequired') : "Ingresá tu email.";
  if (!EMAIL_RE.test(limpio)) return t ? t('validation.emailInvalid') : "El email no parece válido.";
  return null;
}

export function validarPassword(password: string, t?: (key: string, options?: any) => string): string | null {
  if (!password) return t ? t('validation.passwordRequired') : "Ingresá tu contraseña.";
  if (password.length < PASSWORD_MINIMO) {
    return t ? t('validation.passwordMin', { min: PASSWORD_MINIMO }) : `La contraseña necesita ${PASSWORD_MINIMO} caracteres o más.`;
  }
  return null;
}

export function validarConfirmacion(
  password: string,
  confirmacion: string,
  t?: (key: string, options?: any) => string,
): string | null {
  if (!confirmacion) return t ? t('validation.confirmRequired') : "Repetí tu contraseña.";
  if (password !== confirmacion) return t ? t('validation.passwordsMismatch') : "Las contraseñas no coinciden.";
  return null;
}

export function codigoDeError(error: unknown): string {
  return (error as { code?: string }).code ?? "";
}

export function mensajeDeErrorFirebase(codigo: string, t?: (key: string, options?: any) => string): string {
  switch (codigo) {
    case "auth/invalid-email":
      return t ? t('firebaseErrors.invalidEmail') : "El email no es válido.";
    case "auth/invalid-credential":
      return t ? t('firebaseErrors.invalidCredential') : "Email o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return t ? t('firebaseErrors.emailAlreadyInUse') : "Ya existe una cuenta con ese email.";
    case "auth/weak-password":
      return t ? t('firebaseErrors.weakPassword', { min: PASSWORD_MINIMO }) : `La contraseña necesita ${PASSWORD_MINIMO} caracteres o más.`;
    case "auth/too-many-requests":
      return t ? t('firebaseErrors.tooManyRequests') : "Demasiados intentos. Probá en unos minutos.";
    case "auth/network-request-failed":
      return t ? t('firebaseErrors.networkFailed') : "Sin conexión a internet.";
    case "auth/operation-not-allowed":
      return t ? t('firebaseErrors.operationNotAllowed') : "El acceso con email y contraseña no está habilitado.";
    case "auth/user-not-found":
      return t ? t('firebaseErrors.userNotFound') : "No existe una cuenta con ese email.";
    case "auth/unauthorized-continue-uri":
    case "auth/invalid-continue-uri":
      return t ? t('firebaseErrors.unauthorizedContinueUri') : "La URL de retorno del correo no está autorizada.";
    default:
      return t ? t('firebaseErrors.default') : "Ocurrió un error. Intentá de nuevo.";
  }
}
