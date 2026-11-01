import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../configuracion/FirebaseConfig";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  /** Se mantiene sincronizado con Firebase (requiere reload para refrescar). */
  emailVerificado: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Reenvía el correo de verificación a la cuenta logueada. */
  verificarEmail: () => Promise<void>;
  /** Refresca los datos del usuario y devuelve si ya verificó el correo. */
  recargarUsuario: () => Promise<boolean>;
  /** Envía el correo para restablecer la contraseña. */
  cambiarPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificado, setEmailVerificado] = useState(false);

  /**
   * Firebase Auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setEmailVerificado(firebaseUser?.emailVerified ?? false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/password login
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Crea la cuenta y dispara el correo de verificación.
   *
   * Si el envío falla no se rompe el registro: la cuenta ya existe y el
   * correo se puede reenviar desde Perfil.
   */
  const register = async (email: string, password: string) => {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);

    try {
      await sendEmailVerification(credencial.user);
    } catch (error) {
      console.warn("No se pudo enviar el correo de verificación:", error);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
  };

  // Reenvía el correo de verificación.
  const verificarEmail = async () => {
    const actual = auth.currentUser;
    if (!actual) throw new Error("No hay una sesión activa.");
    await sendEmailVerification(actual);
  };

  // Refresca los datos del usuario (por ejemplo, después de abrir el
  // enlace del correo y volver a la app).
  const recargarUsuario = async (): Promise<boolean> => {
    const actual = auth.currentUser;
    if (!actual) return false;

    await actual.reload();

    const verificado = auth.currentUser?.emailVerified ?? false;
    setEmailVerificado(verificado);
    setUser(auth.currentUser);
    return verificado;
  };

  // Envía el correo de restablecimiento de contraseña.
  const cambiarPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerificado,
        login,
        register,
        logout,
        verificarEmail,
        recargarUsuario,
        cambiarPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
