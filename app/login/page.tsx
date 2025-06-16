'use client'

// app/login/page.tsx - Login Page
import { Suspense } from 'react'
import LoginPageContent from './LoginPageContent'

// ============================================================================
// MAIN PAGE COMPONENT WITH SUSPENSE
// ============================================================================

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  )
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function LoginPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}