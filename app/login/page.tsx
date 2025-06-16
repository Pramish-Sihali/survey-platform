'use client'

// app/login/page.tsx - Login Page
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import { AuthService, RoleManager } from '@/lib/auth'
import { UserWithProfile } from '@/lib/utils'

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Get redirect URL from query params
  const redirectTo = searchParams.get('from') || searchParams.get('redirect')

  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Check if user is already authenticated
        if (AuthService.hasValidSession()) {
          const user = AuthService.getStoredUser()
          if (user) {
            // User is already logged in, redirect to appropriate dashboard
            const defaultRoute = RoleManager.getDefaultRoute(user)
            router.replace(redirectTo || defaultRoute)
            return
          }
        }

        // Try to refresh user data if token exists
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          const defaultRoute = RoleManager.getDefaultRoute(currentUser)
          router.replace(redirectTo || defaultRoute)
          return
        }
      } catch (error) {
        // User is not authenticated, stay on login page
        console.log('No valid session found')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [router, redirectTo])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLoginSuccess = (user: UserWithProfile) => {
    const defaultRoute = RoleManager.getDefaultRoute(user)
    router.push(redirectTo || defaultRoute)
  }

  const handleLoginError = (error: string) => {
    console.error('Login error:', error)
    // Error is already handled by the LoginForm component
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex flex-col">
      {/* Header */}
    

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 p-8">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              redirectTo={redirectTo || undefined}
            />
          </div>

          {/* Additional Information */}
          {redirectTo && (
            <div className="mt-6 text-center">
              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <InfoIcon className="w-4 h-4 inline mr-1" />
                  You need to sign in to access that page
                </p>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center space-y-3">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Need Help?</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <p className="flex items-center justify-center gap-1">
                  <QuestionIcon className="w-3 h-3" />
                  Contact your administrator for login credentials
                </p>
                <p className="flex items-center justify-center gap-1">
                  <ShieldIcon className="w-3 h-3" />
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const SurveyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const InfoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const QuestionIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ShieldIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)