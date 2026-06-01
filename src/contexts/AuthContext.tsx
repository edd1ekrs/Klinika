import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { clearAuthStorage } from '@/lib/auth-routes';
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
  const source = raw?.user ?? raw;
  const role = String(source?.role ?? '').trim().toLowerCase();
  return {
    id: source.id ?? source.userId ?? `user-${Date.now()}`,
    email: source.email,
    first_name: source.first_name ?? source.firstName ?? '',
    last_name: source.last_name ?? source.lastName ?? '',
    role: (['admin', 'doctor', 'patient'].includes(role) ? role : 'patient') as Role,
  };
}

const demoUsers: Record<string, User> = {
  'admin@polyclinic.com': { id: 'demo-admin', email: 'admin@polyclinic.com', first_name: 'Admin', last_name: 'Polyclinic', role: 'admin' },
  'doctor@klinika.com': { id: 'demo-doctor', email: 'doctor@klinika.com', first_name: 'Arben', last_name: 'Berisha', role: 'doctor' },
  'patient@klinika.com': { id: 'demo-patient', email: 'patient@klinika.com', first_name: 'Ardit', last_name: 'Krasniqi', role: 'patient' },
};

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
        clearAuthStorage();
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
    try {
      const { token: jwt, user: userData } = await authAPI.register(email, password, firstName, lastName);
      persist(jwt, { ...userData, role: userData.role ?? 'patient' });
    } catch (error: any) {
      if (error?.message !== 'Network Error') throw error;
      persist(`demo-jwt-${Date.now()}`, { id: `patient-${Date.now()}`, email, first_name: firstName, last_name: lastName, role: 'patient' });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token: jwt, user: userData } = await authAPI.login(email, password);
      return persist(jwt, userData);
    } catch (error: any) {
      if (error?.message !== 'Network Error') throw error;
      const demoUser = demoUsers[email.toLowerCase()];
      const validDemoPassword = email.toLowerCase() === 'admin@polyclinic.com' ? 'admin123' : 'password123';
      if (!demoUser || password !== validDemoPassword) {
        throw new Error('Email ose fjalëkalim i pasaktë');
      }
      return persist(`demo-jwt-${Date.now()}`, demoUser);
    }
  };

  const signOut = async () => {
    clearAuthStorage();
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
