import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity } from 'lucide-react';

type Role = 'admin' | 'doctor' | 'staff';

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
  allowed = ['admin', 'doctor', 'staff'],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
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

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (allowed.length > 0 && (!('role' in user) || !allowed.includes(user.role as Role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Qasje e ndaluar</h1>
          <p className="text-muted-foreground">
            Nuk keni leje për të hyrë në këtë faqe. Ju lutemi kyçuni me një llogari të autorizuar.
          </p>
          <Navigate to={redirectTo} replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
