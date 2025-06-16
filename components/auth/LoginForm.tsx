'use client'

// components/auth/LoginForm.tsx - Login Form Component
import { useState, useEffect } from 'react'
import { AuthService, ValidationUtils, RoleManager, type LoginCredentials } from '@/lib/auth'
import { UserWithProfile } from '@/lib'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface LoginFormProps {
  onSuccess?: (user: UserWithProfile) => void
  onError?: (error: string) => void
  redirectTo?: string
  className?: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LoginForm({ 
  onSuccess, 
  onError, 
  redirectTo,
  className 
}: LoginFormProps) {
  // State management
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Clear errors when user types
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }, [credentials.email, credentials.password])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validation = ValidationUtils.validateLoginForm(credentials.email, credentials.password)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const user = await AuthService.login(credentials)
      
      // Success callback
      if (onSuccess) {
        onSuccess(user)
      } else {
        // Default redirect behavior
        const defaultRoute = RoleManager.getDefaultRoute(user)
        window.location.href = redirectTo || defaultRoute
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setErrors({ general: errorMessage })
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInput = (
    field: keyof LoginCredentials,
    label: string,
    type: string = 'text',
    placeholder?: string
  ) => (
    <div className="space-y-1">
      <label htmlFor={field} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={field}
          type={type}
          value={credentials[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-sm transition-colors",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            errors[field]
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-yellow-500 focus:ring-yellow-200"
          )}
        />
        
        {/* Password visibility toggle */}
        {field === 'password' && credentials.password && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Field error */}
      {errors[field] && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertIcon className="w-3 h-3" />
          {errors[field]}
        </p>
      )}
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <LockIcon className="w-6 h-6 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Email input */}
        {renderInput('email', 'Email Address', 'email', 'Enter your email')}

        {/* Password input */}
        {renderInput(
          'password', 
          'Password', 
          showPassword ? 'text' : 'password', 
          'Enter your password'
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
            "focus:outline-none focus:ring-2 focus:ring-yellow-200",
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md"
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Secure login powered by JWT authentication
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const EyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

const AlertIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const LoadingSpinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)