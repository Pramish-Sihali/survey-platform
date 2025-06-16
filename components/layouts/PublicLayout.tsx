
// components/layouts/PublicLayout.tsx
'use client'

import Link from 'next/link'
import { Footer } from './Footer'

interface PublicLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export function PublicLayout({ children, showNavigation = true }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col">
      {/* Simple Header */}
      {showNavigation && (
        <nav className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  <span className="text-teal-600">IXI</span>corp Survey
                </span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/surveys" className="text-gray-600 hover:text-gray-800">
                  Public Surveys
                </Link>
                <Link href="/login">
                  <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
