'use client'

import { SignIn } from '@clerk/nextjs'
import Navigation from '@/app/components/Navigation'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <SignIn />
      </div>
    </main>
  )
}
