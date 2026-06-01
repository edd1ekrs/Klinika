import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authAPI } from '@/services/api';
import type { Role } from '@/types/clinic';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: any): User {
  return {
    id: raw.id,
    email: raw.email,
    first_name: raw.first_name ?? raw.firstName ?? '',
    last_name: raw.last_name ?? raw.lastName ?? '',
    role: (raw.role as Role) ?? 'patient',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount (persists across refresh)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const persist = (jwt: string, raw: any) => {
    const u = normalizeUser(raw);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(jwt);
    setUser(u);
    return u;
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { token: jwt, user: userData } = await authAPI.register(email, password, firstName, lastName);
    persist(jwt, { ...userData, role: userData.role ?? 'patient' });
  };

  const signIn = async (email: string, password: string) => {
    const { token: jwt, user: userData } = await authAPI.login(email, password);
    return persist(jwt, userData);
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const hasRole = (roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
