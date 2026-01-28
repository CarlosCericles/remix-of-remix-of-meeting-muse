import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Definimos tipos básicos para que no den error de compilación
interface AuthContextType {
  user: any;
  session: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: null }>;
  signUp: (email: string, password: string) => Promise<{ error: null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simulamos un usuario activo siempre
  const [user, setUser] = useState<any>({ id: '123', email: 'profesor@preply.com' });
  const [session, setSession] = useState<any>({ user: { id: '123' } });
  const [isLoading, setIsLoading] = useState(false); // Ya no cargamos nada

  // Quitamos toda la lógica de useEffect que llamaba a Supabase
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Funciones simuladas que no hacen nada pero evitan errores
  const signIn = async () => ({ error: null });
  const signUp = async () => ({ error: null });
  const signOut = async () => { console.log("Sesión cerrada") };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
