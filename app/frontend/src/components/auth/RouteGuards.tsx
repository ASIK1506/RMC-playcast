import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Wraps routes that require any authenticated user.
 * Redirects to /login if not authenticated.
 * Shows a loading spinner while session is being validated.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Wraps routes that require SUPER_ADMIN role.
 * Redirects non-admins to the main studio.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
