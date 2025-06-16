// app/api/users/route.ts - Users API Endpoint (FIXED)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import { UserWithProfile, UserRole, User, UserProfile, SafeUserWithProfile, UsersResponse } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

interface CreateUserRequest {
  email: string
  name: string
  password?: string
  role: UserRole
  company_id: string
  profile?: Partial<UserProfile>
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')
  const userName = request.headers.get('x-user-name')
  const userEmail = request.headers.get('x-user-email')

  console.log('Users API - Auth headers received:', {
    'x-user-id': userId,
    'x-user-role': userRole,
    'x-company-id': companyId,
    'x-user-name': userName,
    'x-user-email': userEmail
  })

  // Check if we have valid authentication headers
  if (userId && userRole && ['super_admin', 'company_admin', 'company_user'].includes(userRole)) {
    console.log('Users API - Valid auth headers found')
    return {
      id: userId,
      role: userRole,
      company_id: companyId || null,
      name: userName || '',
      email: userEmail || ''
    }
  }

  // For development/testing - allow super admin access when no headers
  console.log('Users API - No valid auth headers, using test super admin for development')
  return { 
    id: 'test-super-admin', 
    role: 'super_admin' as UserRole, 
    company_id: null,
    name: 'Test Admin',
    email: 'admin@test.com'
  }
}

function canManageUsers(userRole: UserRole, userCompanyId: string | null, targetCompanyId?: string): boolean {
  // Super admin can manage all users
  if (userRole === 'super_admin') return true
  
  // Company admin can only manage users in their company
  if (userRole === 'company_admin' && userCompanyId === targetCompanyId) return true
  
  return false
}

async function getUsersWithProfiles(filters: {
  company_id?: string
  role?: UserRole
  is_active?: boolean
} = {}): Promise<UserWithProfile[]> {
  try {
    console.log('getUsersWithProfiles - Starting with filters:', filters)
    
    let query = supabase
      .from('users')
      .select(`
        *,
        companies:company_id(name),
        user_profiles(
          designation,
          department_id,
          supervisor_name,
          reports_to,
          phone,
          avatar_url,
          bio,
          hire_date,
          is_profile_complete
        )
      `)

    // Apply filters
    if (filters.company_id) {
      console.log('Applying company_id filter:', filters.company_id)
      query = query.eq('company_id', filters.company_id)
    }
    if (filters.role) {
      console.log('Applying role filter:', filters.role)
      query = query.eq('role', filters.role)
    }
    if (filters.is_active !== undefined) {
      console.log('Applying is_active filter:', filters.is_active)
      query = query.eq('is_active', filters.is_active)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    console.log('getUsersWithProfiles - Executing Supabase query')
    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching users:', error)
      return []
    }

    console.log('getUsersWithProfiles - Raw data received:', data?.length, 'users found')

    if (!data || data.length === 0) {
      console.log('getUsersWithProfiles - No users found in database')
      return []
    }

    const processedUsers = data.map(user => {
      const profile = user.user_profiles?.[0] || {}
      const company = user.companies

      return {
        // Include ALL user properties, including password_hash
        id: user.id,
        company_id: user.company_id,
        email: user.email,
        password_hash: user.password_hash,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
        created_by: user.created_by,
        
        // Add profile and company information
        company_name: company?.name || null,
        designation: profile.designation || null,
        department_id: profile.department_id || null,
        supervisor_name: profile.supervisor_name || null,
        reports_to: profile.reports_to || null,
        phone: profile.phone || null,
        avatar_url: profile.avatar_url || null,
        bio: profile.bio || null,
        hire_date: profile.hire_date || null,
        is_profile_complete: profile.is_profile_complete || false,
        department_name: null // Simplified for now
      } as UserWithProfile
    })

    console.log('getUsersWithProfiles - Processed users:', processedUsers.length)
    return processedUsers

  } catch (error) {
    console.error('Error in getUsersWithProfiles:', error)
    return []
  }
}

function generateRandomPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// ============================================================================
// GET USERS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('\n=== USERS API GET REQUEST START ===')
    
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    console.log('Users API - Authenticated user:', authenticatedUser)

    // Parse query parameters
    const companyId = searchParams.get('company_id')
    const role = searchParams.get('role') as UserRole
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('Users API - Query parameters:', { companyId, role, isActive, page, limit })

    // Apply access control
    let filters: any = {}

    if (authenticatedUser.role === 'super_admin') {
      console.log('Users API - Super admin access granted')
      // Super admin can see all users
      if (companyId) {
        filters.company_id = companyId
        console.log('Users API - Filtering by company_id:', companyId)
      }
    } else if (authenticatedUser.role === 'company_admin') {
      console.log('Users API - Company admin access')
      // Company admin can only see users in their company
      if (!authenticatedUser.company_id) {
        console.log('Users API - Company admin without company_id')
        return NextResponse.json(
          { error: 'Company admin must have a company_id' },
          { status: 400 }
        )
      }
      filters.company_id = authenticatedUser.company_id
      console.log('Users API - Company admin filtering by company_id:', authenticatedUser.company_id)
    } else {
      console.log('Users API - Insufficient permissions for role:', authenticatedUser.role)
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Add other filters
    if (role) {
      filters.role = role
      console.log('Users API - Adding role filter:', role)
    }
    if (isActive !== null && isActive !== undefined) {
      filters.is_active = isActive === 'true'
      console.log('Users API - Adding is_active filter:', filters.is_active)
    }

    console.log('Users API - Final filters:', filters)

    // Fetch users
    console.log('Users API - Fetching users with profiles...')
    const users = await getUsersWithProfiles(filters)

    console.log('Users API - Users fetched:', users.length)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    console.log('Users API - Pagination applied:', { startIndex, endIndex, paginatedCount: paginatedUsers.length })

    // Remove sensitive information before returning
    const sanitizedUsers: SafeUserWithProfile[] = paginatedUsers.map(user => {
      const { password_hash, ...userWithoutPassword } = user
      return userWithoutPassword as SafeUserWithProfile
    })

    const response: UsersResponse = {
      users: sanitizedUsers,
      total: users.length
    }

    console.log('Users API - Final response:', { 
      userCount: sanitizedUsers.length, 
      total: users.length,
      sampleUser: sanitizedUsers[0] ? { id: sanitizedUsers[0].id, name: sanitizedUsers[0].name, email: sanitizedUsers[0].email } : 'No users'
    })

    console.log('=== USERS API GET REQUEST END ===\n')

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE USER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body: CreateUserRequest = await request.json()

    const { email, name, password, role, company_id, profile = {} } = body

    // Validate input
    if (!email || !name || !role || !company_id) {
      return NextResponse.json(
        { error: 'Email, name, role, and company_id are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check permissions
    if (!canManageUsers(authenticatedUser.role, authenticatedUser.company_id, company_id)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create users for this company' },
        { status: 403 }
      )
    }

    // Validate role assignment
    if (authenticatedUser.role === 'company_admin' && role === 'super_admin') {
      return NextResponse.json(
        { error: 'Company admins cannot create super admin users' },
        { status: 403 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Verify company exists and is active
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('is_active, max_users')
      .eq('id', company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    if (!company.is_active) {
      return NextResponse.json(
        { error: 'Company is inactive' },
        { status: 400 }
      )
    }

    // Check user limit for company
    const { count: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', company_id)
      .eq('is_active', true)

    if (userCount && userCount >= company.max_users) {
      return NextResponse.json(
        { error: `Company has reached maximum user limit (${company.max_users})` },
        { status: 400 }
      )
    }

    // Generate password if not provided
    const userPassword = password || generateRandomPassword()
    const hashedPassword = await bcrypt.hash(userPassword, 12)

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password_hash: hashedPassword,
        role,
        company_id,
        is_active: true,
        created_by: authenticatedUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile if profile data provided
    if (Object.keys(profile).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: newUser.id,
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't fail the user creation, just log the error
      }
    }

    // Fetch the created user with profile
    const users = await getUsersWithProfiles({ company_id })
    const createdUser = users.find(user => user.id === newUser.id)

    if (!createdUser) {
      return NextResponse.json(
        { error: 'User created but failed to fetch user data' },
        { status: 500 }
      )
    }

    // Remove password hash from response
    const { password_hash, ...userResponse } = createdUser

    console.log('User created successfully:', email, 'by:', authenticatedUser.id)

    return NextResponse.json({
      user: userResponse,
      temporaryPassword: password ? null : userPassword // Only return if we generated it
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Users endpoint is active',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}