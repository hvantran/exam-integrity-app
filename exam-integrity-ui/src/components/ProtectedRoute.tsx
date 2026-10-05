import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  /** If specified, user must have at least one of these roles. */
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    // Gateway owns login (Keycloak); no session means gateway will redirect on next 401
    return (
      <div className="flex min-h-screen items-center justify-center text-sm">
        Authentication required. Please refresh to sign in.
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    // Authenticated but wrong role — send back to landing
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
