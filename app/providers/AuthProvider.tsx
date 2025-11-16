'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/app/lib/supabase'

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Handle email confirmation callback
    const handleAuthCallback = async () => {
      // Check for email confirmation code in query parameters
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('Error exchanging code for session:', error)
          } else if (data.session) {
            setSession(data.session)
            // Clear the code from the URL
            window.history.replaceState({}, document.title, window.location.pathname)
            // Redirect to home
            router.push('/')
          }
        } catch (err) {
          console.error('Error handling auth callback:', err)
        }
      }
    }

    // Get initial session
    const getSession = async () => {
      // First check if we're handling a callback
      if (typeof window !== 'undefined' && window.location.search) {
        await handleAuthCallback()
        // Wait 200ms to ensure cookies are persisted before checking session
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
