import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile, LoginCredentials, RegisterData, PaymentMethod } from '@/types/auth'
import { loginUser, logoutUser, registerUser, getUserProfile, updatePaymentMethod } from '@/services/authService'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updatePayment: (method: PaymentMethod) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch profile when user changes
  const fetchProfile = async (userId: string) => {
    const profileData = await getUserProfile(userId)
    setProfile(profileData)
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    const result = await loginUser(credentials)
    setIsLoading(false)
    return result
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    const result = await registerUser(data)
    setIsLoading(false)
    return result
  }

  const logout = async () => {
    setIsLoading(true)
    await logoutUser()
    setUser(null)
    setProfile(null)
    setSession(null)
    setIsLoading(false)
  }

  const updatePayment = async (method: PaymentMethod) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const result = await updatePaymentMethod(user.id, method)
    if (result.success) {
      await fetchProfile(user.id)
    }
    return result
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePayment,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
