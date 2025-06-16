// app/api/auth/login/route.ts - SIMPLE AUTH VERSION (No Bcrypt)
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'
import { UserWithProfile } from '@/lib/'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: UserWithProfile
  token: string
}

function generateJWT(user: UserWithProfile): string {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company_id: user.company_id,
      is_active: user.is_active
    },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  }

  return jwt.sign(payload, JWT_SECRET)
}

async function getUserWithProfile(userId: string): Promise<UserWithProfile | null> {
  try {
    console.log('🔍 Fetching user profile for ID:', userId)
    
    // First, get the user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user:', userError)
      return null
    }

    console.log('✅ User data fetched:', userData.email)

    // Get company data if user has company_id
    let companyData = null
    if (userData.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', userData.company_id)
        .single()
      
      if (!companyError && company) {
        companyData = company
        console.log('✅ Company data fetched:', company.name)
      }
    }

    // Get user profile data
    let profileData: any = {
      designation: null,
      department_id: null,
      supervisor_name: null,
      reports_to: null,
      phone: null,
      avatar_url: null,
      bio: null,
      hire_date: null,
      is_profile_complete: false
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profileError && profile) {
      profileData = profile
      console.log('✅ Profile data fetched')
    } else {
      console.log('⚠️ No profile data found (this is ok for new users)')
    }

    // Get department data if profile has department_id
    let departmentData = null
    if (profileData.department_id) {
      const { data: department, error: departmentError } = await supabase
        .from('departments')
        .select('name')
        .eq('id', profileData.department_id)
        .single()
      
      if (!departmentError && department) {
        departmentData = department
        console.log('✅ Department data fetched:', department.name)
      }
    }

    // Combine all data
    const userWithProfile = {
      ...userData,
      company_name: companyData?.name || null,
      designation: profileData.designation || null,
      department_id: profileData.department_id || null,
      supervisor_name: profileData.supervisor_name || null,
      reports_to: profileData.reports_to || null,
      phone: profileData.phone || null,
      avatar_url: profileData.avatar_url || null,
      bio: profileData.bio || null,
      hire_date: profileData.hire_date || null,
      is_profile_complete: profileData.is_profile_complete || false,
      department_name: departmentData?.name || null
    } as UserWithProfile

    console.log('✅ Complete user profile assembled')
    return userWithProfile

  } catch (error) {
    console.error('Error in getUserWithProfile:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body



    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      console.error('❌ User not found:', normalizedEmail)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }



    // SIMPLE PASSWORD COMPARISON (No bcrypt)
    // NOTE: password_hash now contains plain text password
    const isPasswordValid = password === userData.password_hash
    


    if (!isPasswordValid) {
      console.error('❌ Password validation failed')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }


    // Check company status (if user has company)
    if (userData.company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('is_active')
        .eq('id', userData.company_id)
        .single()

      if (companyError || !companyData?.is_active) {
        console.error('❌ Company inactive or not found')
        return NextResponse.json(
          { error: 'Account is inactive. Please contact your administrator.' },
          { status: 401 }
        )
      }
    }

    // Get user with profile information
    const userWithProfile = await getUserWithProfile(userData.id)
    if (!userWithProfile) {
      console.error('❌ Failed to fetch user profile')
      return NextResponse.json(
        { error: 'Failed to load user profile' },
        { status: 500 }
      )
    }

    // Update last login
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

    // Generate JWT token
    const token = generateJWT(userWithProfile)

    const response: LoginResponse = {
      user: userWithProfile,
      token
    }

    const nextResponse = NextResponse.json(response)
    nextResponse.cookies.set('survey_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    })

   
    
    return nextResponse

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple Auth Login endpoint is active',
    timestamp: new Date().toISOString()
  })
}