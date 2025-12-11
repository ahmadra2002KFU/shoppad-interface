import { User } from '@supabase/supabase-js'

export type PaymentMethod = 'mada_pay' | 'google_pay' | 'apple_pay'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  preferred_payment_method: PaymentMethod
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  preferred_payment_method?: PaymentMethod
}

export interface QRSession {
  id: string
  token: string
  device_id: string
  user_id: string | null
  status: 'pending' | 'scanned' | 'authenticated' | 'expired'
  expires_at: string
  created_at: string
}
