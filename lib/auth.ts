// lib/auth.ts - Simple Authentication System (No Bcrypt)

import { UserWithProfile, UserRole } from "./types"


// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_KEY = 'survey_auth_token'
const USER_KEY = 'survey_current_user'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthState {
  user: UserWithProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// ============================================================================
// AUTH API CLIENT
// ============================================================================

class AuthApiClient {
  private static baseUrl = '/api'
  private static authToken: string | null = null

  static setAuthToken(token: string) {
    this.authToken = token
  }

  static clearAuthToken() {
    this.authToken = null
  }

  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  static async login(email: string, password: string): Promise<{ user: UserWithProfile; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  static async logout(): Promise<any> {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  static async getCurrentUser(): Promise<{ user: UserWithProfile }> {
    return this.request('/auth/logout') // Using logout endpoint that has GET method for current user
  }
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export class TokenManager {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
    AuthApiClient.setAuthToken(token)
  }

  static clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    AuthApiClient.clearAuthToken()
  }

  static getStoredUser(): UserWithProfile | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static setStoredUser(user: UserWithProfile): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static clearStoredUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  }

  static clearAll(): void {
    this.clearToken()
    this.clearStoredUser()
  }

  // Initialize token on app start
  static initialize(): void {
    const token = this.getToken()
    if (token) {
      AuthApiClient.setAuthToken(token)
    }
  }
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================

export class RoleManager {
  static isSuperAdmin(user: UserWithProfile): boolean {
    return user.role === 'super_admin'
  }

  static isCompanyAdmin(user: UserWithProfile): boolean {
    return user.role === 'company_admin'
  }

  static isCompanyUser(user: UserWithProfile): boolean {
    return user.role === 'company_user'
  }

  static hasAdminAccess(user: UserWithProfile): boolean {
    return this.isSuperAdmin(user) || this.isCompanyAdmin(user)
  }

  static canManageCompany(user: UserWithProfile, companyId: string): boolean {
    if (this.isSuperAdmin(user)) return true
    if (this.isCompanyAdmin(user) && user.company_id === companyId) return true
    return false
  }

  static canAccessRoute(user: UserWithProfile, route: string): boolean {
    // Super admin can access everything
    if (this.isSuperAdmin(user)) return true

    // Company admin routes
    if (route.startsWith('/admin') && this.hasAdminAccess(user)) return true

    // User routes
    if (route.startsWith('/user') && user.role === 'company_user') return true

    // Super admin only routes
    if (route.startsWith('/super-admin') && this.isSuperAdmin(user)) return true

    return false
  }

  static getDefaultRoute(user: UserWithProfile): string {
    if (this.isSuperAdmin(user)) return '/super-admin'
    if (this.isCompanyAdmin(user)) return '/admin'
    if (this.isCompanyUser(user)) return '/user'
    return '/login'
  }

  static getRoleName(role: UserRole): string {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'company_admin': return 'Company Admin'
      case 'company_user': return 'User'
      default: return 'Unknown'
    }
  }

  static getRoleColor(role: UserRole): string {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'company_admin': return 'bg-yellow-100 text-yellow-800'
      case 'company_user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
}

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<UserWithProfile> {
    try {
      const response = await AuthApiClient.login(credentials.email, credentials.password)
      
      // Store token and user
      TokenManager.setToken(response.token)
      TokenManager.setStoredUser(response.user)
      
      return response.user
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Invalid email or password')
    }
  }

  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await AuthApiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with local logout even if server call fails
    } finally {
      // Always clear local storage
      TokenManager.clearAll()
    }
  }

  static async getCurrentUser(): Promise<UserWithProfile | null> {
    try {
      const token = TokenManager.getToken()
      if (!token) return null

      const response = await AuthApiClient.getCurrentUser()
      
      // Update stored user with fresh data
      TokenManager.setStoredUser(response.user)
      
      return response.user
    } catch (error) {
      console.error('Get current user error:', error)
      // If token is invalid, clear everything
      TokenManager.clearAll()
      return null
    }
  }

  static async refreshUserData(): Promise<UserWithProfile | null> {
    return this.getCurrentUser()
  }

  static getStoredUser(): UserWithProfile | null {
    return TokenManager.getStoredUser()
  }

  static isAuthenticated(): boolean {
    return TokenManager.getToken() !== null
  }

  static hasValidSession(): boolean {
    const token = TokenManager.getToken()
    const user = TokenManager.getStoredUser()
    return !!(token && user)
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 3) {
      errors.push('Password must be at least 3 characters long')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static validateLoginForm(email: string, password: string): {
    isValid: boolean
    errors: Record<string, string>
  } {
    const errors: Record<string, string> = {}

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!this.validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      errors.password = 'Password is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// ============================================================================
// ROUTE PROTECTION UTILITIES
// ============================================================================

export class RouteProtection {
  static isPublicRoute(pathname: string): boolean {
    const publicRoutes = ['/login', '/forgot-password', '/reset-password']
    return publicRoutes.includes(pathname)
  }

  static requiresAuth(pathname: string): boolean {
    return !this.isPublicRoute(pathname)
  }

  static getRequiredRole(pathname: string): UserRole | null {
    if (pathname.startsWith('/super-admin')) return 'super_admin'
    if (pathname.startsWith('/admin')) return 'company_admin'
    if (pathname.startsWith('/user')) return 'company_user'
    return null
  }

  static canUserAccessRoute(user: UserWithProfile | null, pathname: string): boolean {
    // Public routes are always accessible
    if (this.isPublicRoute(pathname)) return true

    // Authentication required for all other routes
    if (!user) return false

    // Check role-based access
    return RoleManager.canAccessRoute(user, pathname)
  }

  static getRedirectUrl(user: UserWithProfile | null, intendedPath?: string): string {
    // Not authenticated - go to login
    if (!user) return '/login'

    // If intended path is provided and user can access it, go there
    if (intendedPath && this.canUserAccessRoute(user, intendedPath)) {
      return intendedPath
    }

    // Otherwise, go to default route for user role
    return RoleManager.getDefaultRoute(user)
  }
}



// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize token manager when module loads
if (typeof window !== 'undefined') {
  TokenManager.initialize()
}