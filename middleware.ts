// middleware.ts - Route Protection Middleware (UPDATED)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDefaultDashboardRoute, canAccessRoute } from '@/lib/auths/helpers'
import { safeJsonParse } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password', 
  '/reset-password',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/'
]

// Routes that require specific roles
const ROLE_ROUTES = {
  '/super-admin': ['super_admin'],
  '/admin': ['super_admin', 'company_admin'],
  '/user': ['super_admin', 'company_admin', 'company_user']
}

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/users',
  '/api/companies',
  '/api/surveys',
  '/api/responses',
  '/api/analytics',
  '/api/comments',
  '/api/survey-assignments'
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
}

function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles as UserRole[]
    }
  }
  return null
}

function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return safeJsonParse(jsonPayload, null)
  } catch (error) {
    console.error('Error parsing JWT:', error)
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwtPayload(token)
    if (!payload || !payload.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true
  }
}

function getUserFromToken(token: string): any {
  try {
    const payload = parseJwtPayload(token)
    return payload?.user || null
  } catch {
    return null
  }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

function createUnauthorizedResponse(pathname: string, message = 'Authentication required'): NextResponse {
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: message }, { status: 401 })
  }
  
  const loginUrl = new URL('/login', pathname)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

function createForbiddenResponse(pathname: string, userRole: UserRole): NextResponse {
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }
  
  // Redirect to appropriate dashboard
  const defaultRoute = getDefaultDashboardRoute({ role: userRole } as any)
  return NextResponse.redirect(new URL(defaultRoute, pathname))
}

function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('survey_auth_token')
  return response
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') && !pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const tokenFromCookie = request.cookies.get('survey_auth_token')?.value
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  const token = tokenFromCookie || tokenFromHeader

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is already authenticated and tries to access login, redirect to dashboard
    if (pathname === '/login' && token && !isTokenExpired(token)) {
      const user = getUserFromToken(token)
      if (user?.role) {
        const defaultRoute = getDefaultDashboardRoute(user)
        return NextResponse.redirect(new URL(defaultRoute, request.url))
      }
    }
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!token) {
    return createUnauthorizedResponse(pathname)
  }

  // Validate token expiration
  if (isTokenExpired(token)) {
    const response = createUnauthorizedResponse(pathname, 'Token expired')
    return clearAuthCookie(response)
  }

  // Get and validate user from token
  const user = getUserFromToken(token)
  if (!user || !user.id || !user.role) {
    const response = createUnauthorizedResponse(pathname, 'Invalid token')
    return clearAuthCookie(response)
  }

  // Check role-based access for web routes
  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return createForbiddenResponse(pathname, user.role)
  }

  // Handle root route redirect
  if (pathname === '/') {
    const defaultRoute = getDefaultDashboardRoute(user)
    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  // For API routes, add user context headers
  if (pathname.startsWith('/api') && isProtectedApiRoute(pathname)) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-company-id', user.company_id || '')
    requestHeaders.set('x-user-name', user.name || '')
    requestHeaders.set('x-user-email', user.email || '')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Additional validation for protected web routes
  if (!pathname.startsWith('/api')) {
    // Check if user can access this specific route
    if (!canAccessRoute(user, pathname)) {
      return createForbiddenResponse(pathname, user.role)
    }
  }

  // All checks passed, continue to route
  return NextResponse.next()
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}