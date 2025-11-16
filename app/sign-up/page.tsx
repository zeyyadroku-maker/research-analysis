'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/Navigation'
import { supabase } from '@/app/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // User profile is automatically created by Supabase trigger
      router.push('/')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start analyzing research papers today</p>

            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <a href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
