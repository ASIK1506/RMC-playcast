import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/api';
import { apiLogin, apiLogout, apiGetMe, getAuthToken, setAuthToken } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Validate session on mount (rehydrate from localStorage token)
  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiGetMe();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(currentToken);
      } else {
        // Token expired or invalid
        setAuthToken(null);
        setUser(null);
        setToken(null);
      }
    } catch {
      setAuthToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.success && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isSuperAdmin,
        login,
        logout,
        refreshUser,
      }}
    >
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
