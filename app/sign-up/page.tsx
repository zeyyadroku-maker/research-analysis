'use client'

import { SignUp } from '@clerk/nextjs'
import Navigation from '@/app/components/Navigation'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <SignUp />
      </div>
    </main>
  )
}
