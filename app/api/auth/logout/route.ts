// app/api/auth/logout/route.ts - Logout API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// ============================================================================
// CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production'

// ============================================================================
// TYPES
// ============================================================================

interface LogoutResponse {
  message: string
  timestamp: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie as fallback
  const cookieToken = request.cookies.get('survey_auth_token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// ============================================================================
// LOGOUT ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Extract token from request
    const token = extractToken(request)
    
    if (token) {
      // Verify token is valid (optional - just for logging)
      const payload = verifyToken(token)
      if (payload?.user) {
        console.log('User logged out:', payload.user.email, 'Role:', payload.user.role)
      }

      // In a production environment, you might want to:
      // 1. Add the token to a blacklist/revoked tokens table
      // 2. Store revoked tokens in Redis with expiration
      // 3. Use shorter token expiration times
      
      // For now, we'll rely on client-side token deletion
      // and server-side token expiration
    }

    // Prepare response
    const response: LogoutResponse = {
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    }

    // Create response and clear cookie
    const nextResponse = NextResponse.json(response)
    
    // Clear the auth cookie
    nextResponse.cookies.set('survey_auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return nextResponse

  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, we should still clear the cookie
    // and return success to ensure user is logged out on client side
    const response = NextResponse.json({
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    })

    response.cookies.set('survey_auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

// ============================================================================
// GET CURRENT USER (ME) ENDPOINT
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload || !payload.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Token is valid, return user info
    // Note: This returns the user data from the token
    // For real-time data, you might want to fetch fresh data from database
    return NextResponse.json({
      user: payload.user
    })

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Logout endpoint is active',
    methods: ['POST', 'GET'],
    timestamp: new Date().toISOString()
  })
}