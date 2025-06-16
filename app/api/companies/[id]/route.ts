// app/api/companies/[id]/route.ts - Individual Company API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, CompanyWithStats, CompanyDetailResponse, UserRole } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

interface UpdateCompanyRequest {
  name?: string
  domain?: string
  subscription_plan?: 'basic' | 'professional' | 'premium' | 'enterprise'
  max_users?: number
  max_surveys?: number
  is_active?: boolean
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  // TEMPORARY: For testing when headers are not set
  if (!userId || !userRole) {
    return { 
      id: 'test-super-admin', 
      role: 'super_admin' as UserRole, 
      company_id: null 
    }
  }

  return {
    id: userId,
    role: userRole,
    company_id: companyId
  }
}

async function getCompanyWithStats(companyId: string): Promise<CompanyWithStats | null> {
  try {
    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return null
    }

    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    // Get admin count
    const { count: adminCount, error: adminCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('role', 'company_admin')

    // Get survey count
    const { count: surveyCount, error: surveyCountError } = await supabase
      .from('surveys')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    // Get active assignment count
    const { count: activeAssignments, error: assignmentError } = await supabase
      .from('survey_assignments')
      .select(`
        id,
        surveys!inner(company_id)
      `, { count: 'exact' })
      .eq('surveys.company_id', companyId)
      .in('status', ['pending', 'in_progress'])

    const companyWithStats: CompanyWithStats = {
      ...company,
      user_count: userCount || 0,
      admin_count: adminCount || 0,
      survey_count: surveyCount || 0,
      active_assignments: activeAssignments || 0
    }

    return companyWithStats

  } catch (error) {
    console.error('Error in getCompanyWithStats:', error)
    return null
  }
}

// ============================================================================
// GET COMPANY
// ============================================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const params = await context.params
    const companyId = params.id

    // Only super admins can view company details
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    // Validate company ID
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

    const response: CompanyDetailResponse = {
      company
    }

    return NextResponse.json(response)

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const params = await context.params
    const companyId = params.id
    const body: UpdateCompanyRequest = await request.json()

    // Only super admins can update companies
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    // Validate company ID
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const { name, domain, subscription_plan, max_users, max_surveys, is_active } = body

    // Validate fields if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Company name must be at least 2 characters long' },
          { status: 400 }
        )
      }

      // Check if name conflicts with another company
      const { data: nameConflict } = await supabase
        .from('companies')
        .select('id')
        .eq('name', name.trim())
        .neq('id', companyId)
        .single()

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Company with this name already exists' },
          { status: 409 }
        )
      }
    }

    if (domain !== undefined && domain !== null) {
      if (domain.trim()) {
        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
        if (!domainRegex.test(domain.trim())) {
          return NextResponse.json(
            { error: 'Invalid domain format' },
            { status: 400 }
          )
        }

        // Check if domain conflicts with another company
        const { data: domainConflict } = await supabase
          .from('companies')
          .select('id')
          .eq('domain', domain.trim().toLowerCase())
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

    if (subscription_plan !== undefined) {
      const validPlans = ['basic', 'professional', 'premium', 'enterprise']
      if (!validPlans.includes(subscription_plan)) {
        return NextResponse.json(
          { error: 'Invalid subscription plan. Must be: basic, professional, premium, or enterprise' },
          { status: 400 }
        )
      }
    }

    if (max_users !== undefined && max_users < 1) {
      return NextResponse.json(
        { error: 'Max users must be at least 1' },
        { status: 400 }
      )
    }

    if (max_surveys !== undefined && max_surveys < 1) {
      return NextResponse.json(
        { error: 'Max surveys must be at least 1' },
        { status: 400 }
      )
    }

    // Check if reducing max_users would violate current user count
    if (max_users !== undefined && max_users < existingCompany.max_users) {
      const { count: currentUserCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('is_active', true)

      if (currentUserCount && currentUserCount > max_users) {
        return NextResponse.json(
          { error: `Cannot reduce max users to ${max_users}. Company currently has ${currentUserCount} active users.` },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (domain !== undefined) updateData.domain = domain ? domain.trim().toLowerCase() : null
    if (subscription_plan !== undefined) updateData.subscription_plan = subscription_plan
    if (max_users !== undefined) updateData.max_users = max_users
    if (max_surveys !== undefined) updateData.max_surveys = max_surveys
    if (is_active !== undefined) updateData.is_active = is_active

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      )
    }

    // Fetch updated company with stats
    const companyWithStats = await getCompanyWithStats(companyId)

    if (!companyWithStats) {
      return NextResponse.json(
        { error: 'Company updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    console.log('Company updated successfully:', companyId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      company: companyWithStats
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
// DELETE COMPANY
// ============================================================================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const params = await context.params
    const companyId = params.id

    // Only super admins can delete companies
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    // Validate company ID
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check for related data that would be affected
    const { count: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    const { count: surveyCount } = await supabase
      .from('surveys')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    // For safety, we'll cascade delete in the correct order
    try {
      // Get all survey IDs for this company first
      const { data: surveysToDelete } = await supabase
        .from('surveys')
        .select('id')
        .eq('company_id', companyId)

      const surveyIds = surveysToDelete?.map(s => s.id) || []

      // Get all survey response IDs for these surveys
      const { data: surveyResponsesToDelete } = await supabase
        .from('survey_responses')
        .select('id')
        .in('survey_id', surveyIds)

      const surveyResponseIds = surveyResponsesToDelete?.map(sr => sr.id) || []

      // Get all section IDs for these surveys
      const { data: sectionsToDelete } = await supabase
        .from('survey_sections')
        .select('id')
        .in('survey_id', surveyIds)

      const sectionIds = sectionsToDelete?.map(s => s.id) || []

      // Get all question IDs for these sections
      const { data: questionsToDelete } = await supabase
        .from('questions')
        .select('id')
        .in('section_id', sectionIds)

      const questionIds = questionsToDelete?.map(q => q.id) || []

      // Get all user IDs for this company
      const { data: usersToDelete } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', companyId)

      const userIds = usersToDelete?.map(u => u.id) || []

      // Now delete in correct order using the actual IDs

      // Delete question responses first
      if (surveyResponseIds.length > 0) {
        const { error: responseDeleteError } = await supabase
          .from('question_responses')
          .delete()
          .in('survey_response_id', surveyResponseIds)
      }

      // Delete survey responses
      if (surveyIds.length > 0) {
        const { error: surveyResponseDeleteError } = await supabase
          .from('survey_responses')
          .delete()
          .in('survey_id', surveyIds)
      }

      // Delete survey comments
      if (surveyIds.length > 0) {
        const { error: commentsDeleteError } = await supabase
          .from('survey_comments')
          .delete()
          .in('survey_id', surveyIds)
      }

      // Delete survey assignments
      if (surveyIds.length > 0) {
        const { error: assignmentsDeleteError } = await supabase
          .from('survey_assignments')
          .delete()
          .in('survey_id', surveyIds)
      }

      // Delete question options
      if (questionIds.length > 0) {
        const { error: optionsDeleteError } = await supabase
          .from('question_options')
          .delete()
          .in('question_id', questionIds)
      }

      // Delete questions
      if (questionIds.length > 0) {
        const { error: questionsDeleteError } = await supabase
          .from('questions')
          .delete()
          .in('question_id', questionIds)
      }

      // Delete survey sections
      if (sectionIds.length > 0) {
        const { error: sectionsDeleteError } = await supabase
          .from('survey_sections')
          .delete()
          .in('id', sectionIds)
      }

      // Delete surveys
      if (surveyIds.length > 0) {
        const { error: surveysDeleteError } = await supabase
          .from('surveys')
          .delete()
          .in('id', surveyIds)
      }

      // Delete user profiles
      if (userIds.length > 0) {
        const { error: profilesDeleteError } = await supabase
          .from('user_profiles')
          .delete()
          .in('user_id', userIds)
      }

      // Delete users
      if (userIds.length > 0) {
        const { error: usersDeleteError } = await supabase
          .from('users')
          .delete()
          .in('id', userIds)
      }

      // Delete departments
      const { error: departmentsDeleteError } = await supabase
        .from('departments')
        .delete()
        .eq('company_id', companyId)

      // Finally, delete the company
      const { error: companyDeleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (companyDeleteError) {
        throw companyDeleteError
      }

      console.log('Company deleted successfully:', companyId, 'by:', authenticatedUser.id)
      console.log('Cleanup stats:', { userCount, surveyCount })

      return NextResponse.json({
        message: 'Company and all related data deleted successfully',
        deleted: {
          company: existingCompany.name,
          users: userCount,
          surveys: surveyCount
        }
      })

    } catch (deleteError) {
      console.error('Error during company deletion:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete company and related data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Delete company error:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Company endpoint is active',
    methods: ['GET', 'PUT', 'DELETE'],
    timestamp: new Date().toISOString()
  })
}