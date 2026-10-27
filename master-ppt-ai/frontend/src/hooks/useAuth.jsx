import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch {
          authService.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    if (res.success) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    const stored = localStorage.getItem('user');
    if (stored) {
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...userData }));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
