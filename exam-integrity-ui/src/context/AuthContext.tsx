import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import { getGatewayBaseUrl } from '../utils/gateway';

import { getScopedItem, setScopedItem, removeScopedItem } from '../utils/storage';

export interface AuthUser {
  username: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  grade?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  canSwitchGrade: boolean;
  displayName: string;
  overrideGrade: number | null;
  setOverrideGrade: (grade: number | null) => void;
  effectiveGrade: number | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [overrideGrade, setOverrideGradeState] = useState<number | null>(null);

  const isAdmin = Boolean(Array.isArray(user?.roles) && user.roles.includes('ADMIN'));
  const isTeacher = Boolean(Array.isArray(user?.roles) && user.roles.includes('TEACHER'));
  const isStudent = !isAdmin && !isTeacher;
  const canSwitchGrade = isAdmin || isTeacher;
  const currentUserId = user?.username || (user as any)?.userId || null;

  useEffect(() => {
    if (canSwitchGrade) {
      const saved = getScopedItem('override_grade', currentUserId);
      setOverrideGradeState(saved ? Number(saved) : null);
    } else {
      setOverrideGradeState(null);
    }
  }, [currentUserId, canSwitchGrade]);

  const setOverrideGrade = useCallback(
    (grade: number | null) => {
      if (!canSwitchGrade) return;
      setOverrideGradeState(grade);
      if (grade !== null) {
        setScopedItem('override_grade', String(grade), currentUserId);
      } else {
        removeScopedItem('override_grade', currentUserId);
      }
    },
    [canSwitchGrade, currentUserId],
  );

  const effectiveGrade = (canSwitchGrade ? overrideGrade : null) ?? user?.grade ?? null;

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
    setIsLoggingOut(true);
    const gatewayBaseUrl = getGatewayBaseUrl();
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${gatewayBaseUrl}/logout?redirect_uri=${redirectUri}`;
  }, []);

  const displayName = (() => {
    if (!user) return '';
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return full || user.username || '';
  })();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingOut,
        logout,
        isAdmin,
        isTeacher,
        isStudent,
        canSwitchGrade,
        displayName,
        overrideGrade: canSwitchGrade ? overrideGrade : null,
        setOverrideGrade,
        effectiveGrade,
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
