import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPathForRole } from '@/lib/auth-routes';
import type { Role } from '@/types/clinic';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  allowed?: Role[];
  redirectTo?: string;
}

/**
 * Guards a group of routes. Blocks unauthenticated access (no valid JWT)
 * and enforces role-based access control. Auth state is restored from
 * localStorage on mount, so refresh keeps the user signed in.
 */
export function ProtectedRoute({
  allowed = ['admin', 'doctor'],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm">Duke verifikuar sesionin…</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (allowed.length > 0 && !allowed.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
