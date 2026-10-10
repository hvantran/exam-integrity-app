import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGatewayBaseUrl } from '../utils/gateway';

interface ProtectedRouteProps {
  /** If specified, user must have at least one of these roles. */
  allowedRoles?: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading, isLoggingOut } = useAuth();

  if (isLoading || isLoggingOut) {
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
    const gatewayBaseUrl = getGatewayBaseUrl();
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${gatewayBaseUrl}/oauth2/authorization/keycloak?redirect_uri=${redirectUri}`;
    return null;
  }

  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    // Authenticated but wrong role — send back to landing
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
