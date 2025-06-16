// app/api/companies/[id]/route.ts - Company Detail API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, CompanyWithStats, UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface UpdateCompanyRequest {
  name?: string
  domain?: string
  subscription_plan?: string
  max_users?: number
  max_surveys?: number
  is_active?: boolean
}

interface RouteParams {
  params: {
    id: string
  }
}

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

function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin'
}

async function getCompanyWithStats(companyId: string): Promise<CompanyWithStats | null> {
  try {
    // Fetch company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('Error fetching company:', companyError)
      return null
    }

    // Get user count
    const { count: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)

    // Get admin count
    const { count: adminCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('role', 'company_admin')
      .eq('is_active', true)

    // Get survey count
    const { count: surveyCount } = await supabase
      .from('surveys')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)

    // Get active assignments count (surveys belonging to this company)
    const { data: companySurveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('company_id', companyId)
      .eq('is_active', true)

    let activeAssignments = 0
    if (companySurveys && companySurveys.length > 0) {
      const surveyIds = companySurveys.map(survey => survey.id)
      const { count } = await supabase
        .from('survey_assignments')
        .select('id', { count: 'exact' })
        .in('survey_id', surveyIds)
        .in('status', ['pending', 'in_progress'])

      activeAssignments = count || 0
    }

    return {
      ...company,
      user_count: userCount || 0,
      admin_count: adminCount || 0,
      survey_count: surveyCount || 0,
      active_assignments: activeAssignments
    } as CompanyWithStats
  } catch (error) {
    console.error('Error in getCompanyWithStats:', error)
    return null
  }
}

function validateCompanyUpdateData(data: UpdateCompanyRequest): string | null {
  if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
    return 'Company name must be at least 2 characters long'
  }

  if (data.subscription_plan !== undefined && (!data.subscription_plan || data.subscription_plan.trim().length === 0)) {
    return 'Subscription plan cannot be empty'
  }

  if (data.max_users !== undefined && data.max_users < 1) {
    return 'Max users must be at least 1'
  }

  if (data.max_surveys !== undefined && data.max_surveys < 1) {
    return 'Max surveys must be at least 1'
  }

  if (data.domain !== undefined && data.domain !== null && data.domain.trim().length > 0) {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    if (!domainRegex.test(data.domain.trim())) {
      return 'Invalid domain format'
    }
  }

  return null
}

// ============================================================================
// GET COMPANY BY ID
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const companyId = params.id

    // Only super admins can view companies
    if (!isSuperAdmin(authenticatedUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Fetch company with stats
    const company = await getCompanyWithStats(companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      company
    })

  } catch (error) {
    console.error('Get company error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE COMPANY
// ============================================================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const companyId = params.id
    const body: UpdateCompanyRequest = await request.json()

    // Only super admins can update companies
    if (!isSuperAdmin(authenticatedUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Validate input
    const validationError = validateCompanyUpdateData(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Check if company exists
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (fetchError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check if reducing max_users would violate current usage
    if (body.max_users !== undefined && body.max_users < existingCompany.max_users) {
      const { count: currentUserCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (currentUserCount && currentUserCount > body.max_users) {
        return NextResponse.json(
          { error: `Cannot reduce max users to ${body.max_users}. Company currently has ${currentUserCount} active users.` },
          { status: 400 }
        )
      }
    }

    // Check if reducing max_surveys would violate current usage
    if (body.max_surveys !== undefined && body.max_surveys < existingCompany.max_surveys) {
      const { count: currentSurveyCount } = await supabase
        .from('surveys')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (currentSurveyCount && currentSurveyCount > body.max_surveys) {
        return NextResponse.json(
          { error: `Cannot reduce max surveys to ${body.max_surveys}. Company currently has ${currentSurveyCount} active surveys.` },
          { status: 400 }
        )
      }
    }

    // Check name uniqueness if changing name
    if (body.name && body.name !== existingCompany.name) {
      const { data: nameConflict } = await supabase
        .from('companies')
        .select('id')
        .eq('name', body.name.trim())
        .neq('id', companyId)
        .single()

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Company with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Check domain uniqueness if changing domain
    if (body.domain !== undefined && body.domain !== existingCompany.domain) {
      const domainValue = body.domain?.trim().toLowerCase() || null
      if (domainValue) {
        const { data: domainConflict } = await supabase
          .from('companies')
          .select('id')
          .eq('domain', domainValue)
          .neq('id', companyId)
          .single()

        if (domainConflict) {
          return NextResponse.json(
            { error: 'Company with this domain already exists' },
            { status: 409 }
          )
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.domain !== undefined) updateData.domain = body.domain?.trim().toLowerCase() || null
    if (body.subscription_plan !== undefined) updateData.subscription_plan = body.subscription_plan.trim()
    if (body.max_users !== undefined) updateData.max_users = body.max_users
    if (body.max_surveys !== undefined) updateData.max_surveys = body.max_surveys
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    // If deactivating company, also deactivate all users
    if (body.is_active === false && existingCompany.is_active === true) {
      const { error: deactivateUsersError } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)

      if (deactivateUsersError) {
        console.error('Error deactivating company users:', deactivateUsersError)
        return NextResponse.json(
          { error: 'Failed to deactivate company users' },
          { status: 500 }
        )
      }
    }

    // Update company
    const { error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      )
    }

    // Fetch updated company with stats
    const updatedCompany = await getCompanyWithStats(companyId)
    if (!updatedCompany) {
      return NextResponse.json(
        { error: 'Company updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    console.log('Company updated successfully:', companyId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      company: updatedCompany
    })

  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE COMPANY (SOFT DELETE)
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const companyId = params.id

    // Only super admins can delete companies
    if (!isSuperAdmin(authenticatedUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check if company exists
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (fetchError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check if company has active users
    const { count: activeUserCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (activeUserCount && activeUserCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete company with ${activeUserCount} active users. Deactivate users first.` },
        { status: 400 }
      )
    }

    // Soft delete company (set is_active to false)
    const { error: deleteError } = await supabase
      .from('companies')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)

    if (deleteError) {
      console.error('Error deleting company:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      )
    }

    // Also deactivate all surveys for this company
    const { error: deactivateSurveysError } = await supabase
      .from('surveys')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', companyId)

    if (deactivateSurveysError) {
      console.error('Error deactivating company surveys:', deactivateSurveysError)
      // Don't fail the company deletion for this
    }

    console.log('Company deleted successfully:', companyId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'Company deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete company error:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}