import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export interface AuthUser {
  username: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from gateway session (Keycloak)
  useEffect(() => {
    apiClient
      .get<AuthUser>('/api/auth/me')
      .then((res) => {
        if (res.data && Array.isArray(res.data.roles)) setUser(res.data);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.location.href = '/logout';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
        isAdmin: Array.isArray(user?.roles) && user.roles.includes('ADMIN'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
