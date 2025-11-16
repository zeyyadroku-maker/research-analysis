import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      // Get all cookies from document.cookie
      const cookies: Array<{ name: string; value: string }> = []
      if (typeof document === 'undefined') return cookies

      document.cookie.split('; ').forEach(cookie => {
        const [name, value] = cookie.split('=')
        if (name && value) {
          cookies.push({
            name: decodeURIComponent(name),
            value: decodeURIComponent(value),
          })
        }
      })
      return cookies
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      // Set cookies in document.cookie
      if (typeof document === 'undefined') return

      cookiesToSet.forEach(({ name, value, options }) => {
        const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; ${
          options?.maxAge ? `max-age=${options.maxAge}; ` : ''
        }${options?.domain ? `domain=${options.domain}; ` : ''}${
          options?.secure ? 'secure; ' : ''
        }${options?.sameSite ? `samesite=${options.sameSite}` : ''}`
        document.cookie = cookieString
      })
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
