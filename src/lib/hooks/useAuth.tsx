"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token and user in cookies on initial load
    const storedToken = Cookies.get('token');
    const storedUser = Cookies.get('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        Cookies.remove('token');
        Cookies.remove('user');
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);
      
      // Store in cookies with expiration
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration

      Cookies.set('token', response.token, { expires: expirationDate });
      Cookies.set('user', JSON.stringify(response.user), { expires: expirationDate });
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.register(credentials);
      setUser(response.user);
      setToken(response.token);
      
      // Store in cookies with expiration
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration

      Cookies.set('token', response.token, { expires: expirationDate });
      Cookies.set('user', JSON.stringify(response.user), { expires: expirationDate });
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Si tu as une API de logout, décommente la ligne suivante :
      // await authApi.logout();
      Cookies.remove('token');
      Cookies.remove('user');
      toast.success('Déconnexion réussie ! Redirection en cours...');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    // Update stored user data in cookies
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration
    Cookies.set('user', JSON.stringify(userData), { expires: expirationDate });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { 
    user: context.user, 
    loading: context.isLoading, 
    login: context.login, 
    register: context.register, 
    logout: context.logout,
    updateUser: context.updateUser
  };
}