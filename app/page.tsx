'use client'

// app/page.tsx - Updated Home Page with Authentication
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, RoleManager } from '@/lib/auth'
import { UserWithProfile } from '@/lib/utils'

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserWithProfile | null>(null)

  // ============================================================================
  // AUTHENTICATION CHECK & REDIRECT
  // ============================================================================

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user has valid session
        if (AuthService.hasValidSession()) {
          const storedUser = AuthService.getStoredUser()
          if (storedUser) {
            setUser(storedUser)
            // Redirect to appropriate dashboard
            const defaultRoute = RoleManager.getDefaultRoute(storedUser)
            router.replace(defaultRoute)
            return
          }
        }

        // Try to get current user from server
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const defaultRoute = RoleManager.getDefaultRoute(currentUser)
          router.replace(defaultRoute)
          return
        }

        // No valid authentication, redirect to login
        router.replace('/login')
      } catch (error) {
        console.log('No valid session, redirecting to login')
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Loading Spinner */}
          <div className="w-12 h-12 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {user ? `Welcome back, ${user.name}` : 'IXI Survey Platform'}
            </h2>
            <p className="text-gray-600">
              {user ? 'Redirecting to your dashboard...' : 'Checking authentication...'}
            </p>
          </div>

          {/* Platform Logo */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-10 h-10 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">i</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              <span className="text-yellow-600">IXI</span>corp Survey Platform
            </span>
          </div>
        </div>
      </div>
    )
  }

  // This should rarely be seen since we redirect immediately
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the appropriate page.</p>
      </div>
    </div>
  )
}