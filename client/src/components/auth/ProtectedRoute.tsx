import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A component that ensures a route is protected and
 * only accessible to authenticated users
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useAuthRedirect({
    requireAuth: true,
    redirectTo: '/login',
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Render children once we know the user is authenticated
  // (useAuthRedirect will redirect if not authenticated)
  return <>{children}</>;
}