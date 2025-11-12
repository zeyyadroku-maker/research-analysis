import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'AI Research Analysis Platform',
  description: 'Analyze research papers with AI-powered credibility and bias detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
