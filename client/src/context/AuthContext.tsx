import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User, AuthResponse, InsertUser } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

type RegisterData = Omit<InsertUser, 'password'> & { password: string };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in on first render
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check authentication status
  const checkAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<User | null>({
        method: 'GET',
        url: '/api/auth/user',
        on401: 'returnNull'
      });
      
      setUser(response);
    } catch (err) {
      setUser(null);
      // Don't set error here as this is a background check
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<AuthResponse>({
        method: 'POST',
        url: '/api/auth/login',
        data: { username, password }
      });
      
      // Cast user to the correct type (User) since it comes from userResponseSchema
      setUser(response.user as User);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiRequest<User>({
        method: 'POST',
        url: '/api/auth/register',
        data: userData
      });
      
      toast({
        title: "Registration successful",
        description: "Please log in with your new account",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{message: string}>({
        method: 'POST',
        url: '/api/auth/logout',
      });
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}