import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { AdminUser } from '../types';

interface AuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  needsSetup: boolean;
  systemInfo: { databaseMode: string; mediaMode: string } | null;
  refreshStatus: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  setupFirstAdmin: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{
    databaseMode: string;
    mediaMode: string;
  } | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/auth/status');
      setNeedsSetup(Boolean(data.needsSetup));
      setAdmin(data.authenticated ? data.admin : null);
      if (data.system) {
        setSystemInfo(data.system);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/admin/auth/login', { email, password });
    setAuthToken(data.token);
    setAdmin(data.admin);
    setNeedsSetup(false);
  };

  const setupFirstAdmin = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/admin/auth/setup', { name, email, password });
    setAuthToken(data.token);
    setAdmin(data.admin);
    setNeedsSetup(false);
  };

  const logout = async () => {
    await api.post('/admin/auth/logout').catch(() => undefined);
    setAuthToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        needsSetup,
        systemInfo,
        refreshStatus,
        login,
        setupFirstAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
