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
