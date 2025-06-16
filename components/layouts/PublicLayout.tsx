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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Transparent Header */}
      {showNavigation && (
        <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-800 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  <span className="text-green-800">IXI</span>corp Survey
                </span>
              </Link>
              
              <div className="flex items-center gap-6">
                <Link href="/surveys" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                  Public Surveys
                </Link>
                <Link href="/login">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
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