'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'

interface BackendUser {
  id: string
  email: string
  name: string
  role: string
  businessId: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  backendUser: BackendUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<void>
  hasRole: (role?: 'admin' | 'staff') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch backend user data
  const fetchBackendUser = async (token: string) => {
    try {
      apiClient.setToken(token)
      const userData = await apiClient.getUser()
      console.log('Backend user data fetched:', userData)
      setBackendUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to fetch backend user data:', error)
      setBackendUser(null)
      return null
    }
  }

  useEffect(() => {
    // Only initialize if Supabase is available
    if (!supabase) {
      console.warn('Supabase not configured, skipping auth initialization')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0
      });
      setUser(session?.user ?? null)
      if (session?.access_token) {
        await fetchBackendUser(session.access_token)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          hasSession: !!session,
          hasToken: !!session?.access_token,
          tokenLength: session?.access_token?.length || 0
        });
        
        setUser(session?.user ?? null)
        if (session?.access_token) {
          await fetchBackendUser(session.access_token)
        } else {
          console.log('Clearing backend user state due to no session')
          apiClient.setToken('')
          setBackendUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn attempt:', { email })
      
      if (!supabase) {
        throw new Error('Supabase not configured')
      }
      
      // First authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        return { data: null, error }
      }

      console.log('Supabase auth successful:', { user: data.user?.email })

      // Then authenticate with our backend API
      if (data.session?.access_token) {
        try {
          console.log('Attempting backend authentication...')
          const backendResponse = await apiClient.login(email, password)
          console.log('Backend authentication successful:', backendResponse)
          
          // Fetch backend user data
          await fetchBackendUser(data.session.access_token)
          
          return { data: { ...data, backend: backendResponse }, error: null }
        } catch (backendError) {
          console.error('Backend authentication failed:', backendError)
          // Still return Supabase auth success, but log backend error
          // This allows users to use Supabase auth even if backend is down
          return { data, error: null }
        }
      }

      return { data, error }
    } catch (error) {
      console.error('SignIn error:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('SignUp attempt:', { email, userData })
      
      if (!supabase) {
        throw new Error('Supabase not configured')
      }
      
      // First check if user already exists in Supabase
      try {
        const { data: existingUser } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (existingUser.user) {
          console.log('User already exists in Supabase, proceeding with backend registration only')
          // User exists, just register with backend
          const backendData = {
            email,
            password,
            name: userData.name,
            business_name: userData.business_name
          }
          
          const backendResponse = await apiClient.register(backendData)
          console.log('Backend registration successful for existing user:', backendResponse)
          
          // Fetch backend user data
          if (existingUser.session?.access_token) {
            await fetchBackendUser(existingUser.session.access_token)
          }
          
          return { 
            data: { 
              backend: backendResponse, 
              supabase: existingUser,
              userExists: true 
            }, 
            error: null 
          }
        }
      } catch (checkError) {
        // User doesn't exist, proceed with full registration
        console.log('User does not exist in Supabase, proceeding with full registration')
      }
      
      // Register with backend first
      const backendData = {
        email,
        password,
        name: userData.name,
        business_name: userData.business_name
      }
      
      console.log('Backend registration data:', backendData)
      
      const backendResponse = await apiClient.register(backendData)
      console.log('Backend registration successful:', backendResponse)

      // Try to create Supabase user
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData
          }
        })

        if (error) {
          console.error('Supabase registration error:', error)
          // Still return success since backend registration worked
          return { data: { backend: backendResponse, supabase: null }, error: null }
        }

        console.log('Supabase registration successful:', { user: data.user?.email })
        
        // Fetch backend user data if we have a session
        if (data.session?.access_token) {
          await fetchBackendUser(data.session.access_token)
        }
        
        return { data: { ...data, backend: backendResponse }, error: null }
      } catch (supabaseError) {
        console.error('Supabase operation failed:', supabaseError)
        // Still return success since backend registration worked
        return { data: { backend: backendResponse, supabase: null }, error: null }
      }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      
      // Clear backend user state immediately
      setBackendUser(null)
      apiClient.setToken('')
      
      // Sign out from Supabase if available
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Supabase sign out error:', error)
        } else {
          console.log('Sign out successful')
        }
      }
      
      // Ensure user state is cleared
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, clear the states
      setUser(null)
      setBackendUser(null)
      apiClient.setToken('')
    }
  }

  const hasRole = (role?: 'admin' | 'staff'): boolean => {
    if (!backendUser) {
      return false;
    }
    if (role) {
      return backendUser.role === role;
    }
    return true; // Authenticated user if no specific role is required
  };

  const value = {
    user,
    backendUser,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
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