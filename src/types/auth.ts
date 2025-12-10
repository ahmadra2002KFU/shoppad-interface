/**
 * Authentication Types
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  preferred_payment_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  preferredPaymentId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
