// middleware.ts - Route Protection Middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
  '/api/survey-assignments',
  '/api/departments'
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

function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}

function parseJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
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

function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin'
    case 'company_admin':
      return '/admin'
    case 'company_user':
      return '/user'
    default:
      return '/login'
  }
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookie or Authorization header
  const tokenFromCookie = request.cookies.get('survey_auth_token')?.value
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  const token = tokenFromCookie || tokenFromHeader

  // For static assets and Next.js internals, skip middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is already authenticated and tries to access login, redirect to dashboard
    if (pathname === '/login' && token && !isTokenExpired(token)) {
      const user = getUserFromToken(token)
      if (user?.role) {
        const defaultRoute = getDefaultRouteForRole(user.role)
        return NextResponse.redirect(new URL(defaultRoute, request.url))
      }
    }
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // For web routes, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate token
  if (isTokenExpired(token)) {
    // Clear expired token
    const response = pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Token expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    
    response.cookies.delete('survey_auth_token')
    return response
  }

  // Get user from token
  const user = getUserFromToken(token)
  if (!user) {
    const response = pathname.startsWith('/api')
      ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    
    response.cookies.delete('survey_auth_token')
    return response
  }

  // Check role-based access for web routes
  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Redirect to appropriate dashboard
    const defaultRoute = getDefaultRouteForRole(user.role)
    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  // Handle root route redirect
  if (pathname === '/') {
    const defaultRoute = getDefaultRouteForRole(user.role)
    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  // Additional security checks for API routes
  if (pathname.startsWith('/api')) {
    // Company isolation for non-super-admin users
    if (user.role !== 'super_admin' && isProtectedApiRoute(pathname)) {
      // Add user context to headers for API routes to use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-role', user.role)
      requestHeaders.set('x-company-id', user.company_id || '')
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
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