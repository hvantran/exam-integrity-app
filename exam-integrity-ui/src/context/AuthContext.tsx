import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export interface AuthUser {
  username: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('exam_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        // Guard against stale data that may lack the roles array
        if (parsed && Array.isArray(parsed.roles)) {
          setUser(parsed);
        } else {
          sessionStorage.removeItem('exam_user');
          sessionStorage.removeItem('exam_creds');
        }
      } catch {
        sessionStorage.removeItem('exam_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    // Store credentials so apiClient interceptor can send them
    sessionStorage.setItem('exam_creds', JSON.stringify({ username, password }));
    try {
      const res = await apiClient.get<AuthUser>('/api/auth/me');
      const authUser = res.data;
      setUser(authUser);
      sessionStorage.setItem('exam_user', JSON.stringify(authUser));
      return authUser;
    } catch (err) {
      sessionStorage.removeItem('exam_creds');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('exam_creds');
    sessionStorage.removeItem('exam_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin: Array.isArray(user?.roles) && user.roles.includes('ADMIN') }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
