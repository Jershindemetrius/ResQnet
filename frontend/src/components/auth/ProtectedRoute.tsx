import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

/**
 * ProtectedRoute Guard
 * 1. Checks if the user is authenticated. If not, redirects to /login with redirect parameter.
 * 2. Checks if the authenticated user has one of the allowed roles. If not, redirects to /403 Forbidden.
 * 3. Renders children or <Outlet /> if authorization passes.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
            Verifying Security Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: User role [${user.role}] not in allowed roles [${allowedRoles.join(', ')}]`);
    return <Navigate to="/403" state={{ from: location.pathname, requiredRoles: allowedRoles }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
