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
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        // Parse the hash parameters
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (accessToken && refreshToken && type === 'signup') {
          try {
            // Set the session with the tokens from the callback
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (error) {
              console.error('Error setting session:', error)
            } else if (data.session) {
              setSession(data.session)
              // Clear the hash from the URL
              window.history.replaceState({}, document.title, window.location.pathname)
              // Redirect to home
              router.push('/')
            }
          } catch (err) {
            console.error('Error handling auth callback:', err)
          }
        }
      }
    }

    // Get initial session
    const getSession = async () => {
      // First check if we're handling a callback
      if (typeof window !== 'undefined' && window.location.hash) {
        await handleAuthCallback()
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
