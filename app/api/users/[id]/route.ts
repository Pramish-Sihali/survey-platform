// app/api/users/[id]/route.ts - User Detail API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import { UserWithProfile, UserRole, UserProfile } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  is_active?: boolean
  password?: string
}

interface UpdateProfileRequest {
  designation?: string
  department_id?: string
  supervisor_name?: string
  reports_to?: string
  phone?: string
  avatar_url?: string
  bio?: string
  hire_date?: string
}

// Fix: Remove the RouteParams interface and use inline typing
// The second parameter should match Next.js's expected structure directly

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  return {
    id: userId,
    role: userRole,
    company_id: companyId
  }
}

function canManageUser(userRole: UserRole, userCompanyId: string, targetUser: any): boolean {
  // Super admin can manage all users
  if (userRole === 'super_admin') return true
  
  // Company admin can manage users in their company (except super admins)
  if (userRole === 'company_admin' && 
      userCompanyId === targetUser.company_id && 
      targetUser.role !== 'super_admin') {
    return true
  }
  
  return false
}

function canViewUser(userRole: UserRole, userCompanyId: string, userId: string, targetUser: any): boolean {
  // Super admin can view all users
  if (userRole === 'super_admin') return true
  
  // Users can view their own profile
  if (userId === targetUser.id) return true
  
  // Company admin can view users in their company
  if (userRole === 'company_admin' && userCompanyId === targetUser.company_id) return true
  
  return false
}

async function getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  try {
    const { data, error } = await supabase
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
        ),
        departments:user_profiles(department_id(name))
      `)
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching user with profile:', error)
      return null
    }

    // Transform the nested data structure
    const profile = data.user_profiles?.[0] || {}
    const company = data.companies
    const department = data.departments?.[0]?.department_id

    return {
      ...data,
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
      department_name: department?.name || null
    } as UserWithProfile
  } catch (error) {
    console.error('Error in getUserWithProfile:', error)
    return null
  }
}

// ============================================================================
// GET USER BY ID
// ============================================================================

// Fix: Use inline typing that matches Next.js structure
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: userId } = await params 

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch the target user
    const targetUser = await getUserWithProfile(userId)
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canViewUser(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, targetUser)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view this user' },
        { status: 403 }
      )
    }

    // Remove sensitive information
    const { password_hash, ...userResponse } = targetUser

    return NextResponse.json({
      user: userResponse
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE USER
// ============================================================================

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: userId } = await params 
    const body: UpdateUserRequest = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch the target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isSelfUpdate = authenticatedUser.id === userId
    if (!isSelfUpdate && !canManageUser(authenticatedUser.role, authenticatedUser.company_id, targetUser)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this user' },
        { status: 403 }
      )
    }

    // Validate role changes
    if (body.role && body.role !== targetUser.role) {
      // Users cannot change their own role
      if (isSelfUpdate) {
        return NextResponse.json(
          { error: 'Cannot change your own role' },
          { status: 400 }
        )
      }

      // Company admin cannot create super admin
      if (authenticatedUser.role === 'company_admin' && body.role === 'super_admin') {
        return NextResponse.json(
          { error: 'Company admins cannot assign super admin role' },
          { status: 403 }
        )
      }

      // Cannot demote the last super admin
      if (targetUser.role === 'super_admin' && body.role !== 'super_admin') {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('role', 'super_admin')
          .eq('is_active', true)

        if (count && count <= 1) {
          return NextResponse.json(
            { error: 'Cannot demote the last super admin' },
            { status: 400 }
          )
        }
      }
    }

    // Validate email uniqueness if changing email
    if (body.email && body.email !== targetUser.email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', body.email.toLowerCase().trim())
        .neq('id', userId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name) updateData.name = body.name.trim()
    if (body.email) updateData.email = body.email.toLowerCase().trim()
    if (body.role !== undefined) updateData.role = body.role
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    // Handle password update
    if (body.password) {
      // Validate password strength
      if (body.password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        )
      }
      updateData.password_hash = await bcrypt.hash(body.password, 12)
    }

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Fetch updated user with profile
    const updatedUser = await getUserWithProfile(userId)
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    // Remove sensitive information
    const { password_hash, ...userResponse } = updatedUser

    console.log('User updated successfully:', userId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      user: userResponse
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE USER (SOFT DELETE)
// ============================================================================

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: userId } = await params 

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Cannot delete yourself
    if (authenticatedUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Fetch the target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canManageUser(authenticatedUser.role, authenticatedUser.company_id, targetUser)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this user' },
        { status: 403 }
      )
    }

    // Cannot delete the last super admin
    if (targetUser.role === 'super_admin') {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'super_admin')
        .eq('is_active', true)

      if (count && count <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last super admin' },
          { status: 400 }
        )
      }
    }

    // Soft delete user (set is_active to false)
    const { error: deleteError } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    console.log('User deleted successfully:', userId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: userId } = await params 
    const body: UpdateProfileRequest = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch the target user
    const targetUser = await getUserWithProfile(userId)
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions (users can update their own profile, admins can update their company's users)
    const isSelfUpdate = authenticatedUser.id === userId
    if (!isSelfUpdate && !canManageUser(authenticatedUser.role, authenticatedUser.company_id, targetUser)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this user profile' },
        { status: 403 }
      )
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const profileData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating user profile:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
    } else {
      // Create new profile
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...profileData,
          created_at: new Date().toISOString()
        })

      if (createError) {
        console.error('Error creating user profile:', createError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
    }

    // Fetch updated user with profile
    const updatedUser = await getUserWithProfile(userId)
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Profile updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    // Remove sensitive information
    const { password_hash, ...userResponse } = updatedUser

    console.log('User profile updated successfully:', userId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      user: userResponse
    })

  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}