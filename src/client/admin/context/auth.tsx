import { createContext, useContext, useEffect, useState } from 'react';

import { apiClient, getData } from '@app/api';
import { Api } from '@app/api-endpoints';

type User = { userId: number; username: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.provide(Api.auth.session, {})
      .then((r) => { if (r.status === 'success') setUser(r.data); })
      .catch((e) => { console.error('Session check failed:', e); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await apiClient.provide(Api.auth.login, { username, password });
    setUser(getData(result));
  };

  const logout = async () => {
    await apiClient.provide(Api.auth.logout, {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
