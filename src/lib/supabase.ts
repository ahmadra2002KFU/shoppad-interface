import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://khuamipkrewbgdgvwlbj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.warn('Supabase anon key not found. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface DbProduct {
  id: string
  name: string
  name_ar: string | null
  category: string
  price: number
  image: string
  barcode: string
  weight: number | null
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DbCategory {
  id: string
  name: string
  name_ar: string | null
  display_order: number
}

export interface DbProfile {
  id: string
  phone: string
  full_name: string
  preferred_payment_method: 'mada_pay' | 'google_pay' | 'apple_pay'
  created_at: string
  updated_at: string
}

export interface DbQRSession {
  id: string
  token: string
  device_id: string
  user_id: string | null
  status: 'pending' | 'scanned' | 'authenticated' | 'expired'
  expires_at: string
  created_at: string
}

export interface DbCart {
  id: string
  user_id: string
  is_active: boolean
  created_at: string
}

export interface DbCartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  added_at: string
}

export interface DbOrder {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  payment_method: 'mada_pay' | 'google_pay' | 'apple_pay'
  subtotal: number
  tax: number
  total: number
  items_count: number
  created_at: string
}

export interface DbOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  line_total: number
}
