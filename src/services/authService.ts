import { supabase } from '@/lib/supabase'
import { LoginCredentials, RegisterData, UserProfile, PaymentMethod } from '@/types/auth'

// Register a new user with email
export async function registerUser(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          email: data.email,
          full_name: data.full_name,
          preferred_payment_method: data.preferred_payment_method || 'mada_pay'
        }
      }
    })

    if (authError) {
      console.error('Registration error:', authError)
      if (authError.message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please login instead.' }
      }
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Registration failed - no user returned' }
    }

    // Check if email confirmation is required
    if (!authData.session) {
      // User needs to confirm email - this is fine for real emails
      return { success: true }
    }

    return { success: true }
  } catch (err) {
    console.error('Registration exception:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Login with email and password
export async function loginUser(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      console.error('Login error:', error)
      if (error.message.includes('Invalid login')) {
        return { success: false, error: 'Invalid email or password' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please confirm your email before logging in' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Login exception:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut()
}

// Get current user's profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as UserProfile
  } catch (err) {
    console.error('Profile fetch exception:', err)
    return null
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'preferred_payment_method'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Profile update exception:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update preferred payment method
export async function updatePaymentMethod(
  userId: string,
  method: PaymentMethod
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { preferred_payment_method: method })
}
