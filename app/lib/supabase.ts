import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      if (typeof document === 'undefined') return []

      const cookies: Array<{ name: string; value: string }> = []
      try {
        // Parse all cookies from document.cookie string
        if (document.cookie) {
          document.cookie.split('; ').forEach(cookie => {
            if (cookie.trim()) {
              const eqIndex = cookie.indexOf('=')
              if (eqIndex > 0) {
                const name = cookie.substring(0, eqIndex).trim()
                const value = cookie.substring(eqIndex + 1).trim()
                cookies.push({ name, value })
              }
            }
          })
        }
      } catch (error) {
        console.error('Error reading cookies:', error)
      }
      return cookies
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      if (typeof document === 'undefined') return

      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Build cookie string with proper formatting
          let cookieString = `${name}=${value}`
          cookieString += '; path=/'

          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`
          }
          if (options?.secure) {
            cookieString += '; secure'
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }

          document.cookie = cookieString
        })
      } catch (error) {
        console.error('Error setting cookies:', error)
      }
    },
  },
})

// Server-side client for admin operations
export const createServiceSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
