import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.provide(Api.auth.session, {})
      .then((r) => { if (r.status === 'success') setUser(r.data); })
      .catch((e) => { console.error('Session check failed:', e); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiClient.provide(Api.auth.login, { username, password });
    setUser(getData(result));
  }, []);

  const logout = useCallback(async () => {
    await apiClient.provide(Api.auth.logout, {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
