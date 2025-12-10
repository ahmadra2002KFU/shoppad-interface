/**
 * Authentication Context
 * Manages user authentication state
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import type { User, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  loginWithQRToken: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      // First check if we have a stored user (for offline support)
      const storedUser = api.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Then verify with server if we have a token
      const token = api.getToken();
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            setUser(response.data);
            api.setStoredUser(response.data);
          } else {
            // Token invalid, clear auth
            api.clearAuth();
            setUser(null);
          }
        } catch {
          // Network error - keep using stored user for offline support
          if (!storedUser) {
            api.clearAuth();
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const response = await api.login(credentials);

    if (response.success && response.data) {
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: response.error };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const response = await api.register(data);

    if (response.success && response.data) {
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: response.error };
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    api.setStoredUser(updatedUser);
  };

  const loginWithQRToken = (token: string, userData: User) => {
    api.setToken(token);
    api.setStoredUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        loginWithQRToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
