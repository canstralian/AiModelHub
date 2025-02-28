import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

/**
 * A hook that redirects authenticated or unauthenticated users
 * based on the specified requirement
 */
export function useAuthRedirect(options: { 
  requireAuth: boolean;
  redirectTo: string;
}) {
  const { requireAuth, redirectTo } = options;
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect after we've checked authentication status
    if (!isLoading) {
      // If we require auth and there's no user, redirect to login
      if (requireAuth && !user) {
        setLocation(redirectTo);
      }
      
      // If we require NO auth and there IS a user, redirect to home
      if (!requireAuth && user) {
        setLocation(redirectTo);
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, setLocation]);

  return { isLoading, isAuthenticated: !!user };
}