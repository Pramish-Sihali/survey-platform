// app/api/survey-assignments/route.ts - Survey Assignments API Endpoint (FIXED)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SurveyAssignment, SurveyAssignmentWithDetails, AssignmentStatus, UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface CreateAssignmentRequest {
  survey_id: string
  user_ids: string[]
  notes?: string
  due_date?: string
}

interface AssignmentsResponse {
  assignments: SurveyAssignmentWithDetails[]
  total: number
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

function canManageAssignments(userRole: UserRole, userCompanyId: string, targetCompanyId?: string): boolean {
  // Super admin can manage all assignments
  if (userRole === 'super_admin') return true
  
  // Company admin can manage assignments in their company
  if (userRole === 'company_admin' && userCompanyId === targetCompanyId) return true
  
  return false
}

function canViewAssignments(userRole: UserRole, userCompanyId: string, userId: string, targetCompanyId?: string, targetUserId?: string): boolean {
  // Super admin can view all assignments
  if (userRole === 'super_admin') return true
  
  // Company admin can view assignments in their company
  if (userRole === 'company_admin' && userCompanyId === targetCompanyId) return true
  
  // Users can view their own assignments
  if (userRole === 'company_user' && userId === targetUserId) return true
  
  return false
}

async function getAssignmentsWithDetails(filters: {
  user_id?: string
  survey_id?: string
  status?: AssignmentStatus
  company_id?: string
} = {}): Promise<SurveyAssignmentWithDetails[]> {
  try {
    let query = supabase
      .from('survey_assignments')
      .select(`
        *,
        surveys!survey_assignments_survey_id_fkey(
          id,
          title,
          description,
          company_id,
          is_active,
          is_published,
          allows_refill,
          start_date,
          end_date
        ),
        users!survey_assignments_user_id_fkey(
          id,
          name,
          email,
          company_id
        ),
        assigned_by_user:users!survey_assignments_assigned_by_fkey(
          id,
          name,
          email
        )
      `)

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.survey_id) {
      query = query.eq('survey_id', filters.survey_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Order by assignment date
    query = query.order('assigned_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assignments:', error)
      return []
    }

    // Filter by company if specified (through survey or user relationship)
    let assignments = data || []
    if (filters.company_id) {
      assignments = assignments.filter(assignment => 
        assignment.surveys?.company_id === filters.company_id ||
        assignment.users?.company_id === filters.company_id
      )
    }

    return assignments.map(assignment => ({
      ...assignment,
      survey_title: assignment.surveys?.title || 'Unknown Survey',
      survey_description: assignment.surveys?.description || null,
      user_name: assignment.users?.name || 'Unknown User',
      user_email: assignment.users?.email || 'Unknown Email',
      assigned_by_name: assignment.assigned_by_user?.name || 'Unknown Admin',
      company_name: 'Company' // Could be enhanced to fetch actual company name
    })) as SurveyAssignmentWithDetails[]
  } catch (error) {
    console.error('Error in getAssignmentsWithDetails:', error)
    return []
  }
}

async function validateAssignmentData(data: CreateAssignmentRequest, assignerId: string, assignerCompanyId: string): Promise<{
  isValid: boolean
  error?: string
  survey?: any
  users?: any[]
}> {
  try {
    // Validate survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', data.survey_id)
      .eq('is_active', true)
      .single()

    if (surveyError || !survey) {
      return { isValid: false, error: 'Survey not found or inactive' }
    }

    // Check if survey belongs to assigner's company (or if super admin)
    if (assignerCompanyId !== survey.company_id) {
      return { isValid: false, error: 'Cannot assign surveys from other companies' }
    }

    // Validate users
    if (!data.user_ids || data.user_ids.length === 0) {
      return { isValid: false, error: 'At least one user must be specified' }
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, company_id, is_active')
      .in('id', data.user_ids)
      .eq('is_active', true)

    if (usersError || !users || users.length === 0) {
      return { isValid: false, error: 'No valid users found' }
    }

    if (users.length !== data.user_ids.length) {
      return { isValid: false, error: 'Some users not found or inactive' }
    }

    // Check if all users belong to the same company
    const invalidUsers = users.filter(user => user.company_id !== assignerCompanyId)
    if (invalidUsers.length > 0) {
      return { isValid: false, error: 'Cannot assign surveys to users from other companies' }
    }

    // Check for existing assignments
    const { data: existingAssignments } = await supabase
      .from('survey_assignments')
      .select('user_id')
      .eq('survey_id', data.survey_id)
      .in('user_id', data.user_ids)
      .in('status', ['pending', 'in_progress'])

    if (existingAssignments && existingAssignments.length > 0) {
      const assignedUserIds = existingAssignments.map(a => a.user_id)
      const assignedUsers = users.filter(u => assignedUserIds.includes(u.id))
      const assignedUserNames = assignedUsers.map(u => u.name).join(', ')
      return { 
        isValid: false, 
        error: `These users already have pending assignments for this survey: ${assignedUserNames}` 
      }
    }

    // Validate due date
    if (data.due_date) {
      const dueDate = new Date(data.due_date)
      const now = new Date()
      
      if (dueDate <= now) {
        return { isValid: false, error: 'Due date must be in the future' }
      }

      // Check against survey end date
      if (survey.end_date && dueDate > new Date(survey.end_date)) {
        return { isValid: false, error: 'Due date cannot be after survey end date' }
      }
    }

    return { isValid: true, survey, users }
  } catch (error) {
    console.error('Error validating assignment data:', error)
    return { isValid: false, error: 'Failed to validate assignment data' }
  }
}

// ============================================================================
// GET ASSIGNMENTS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const userId = searchParams.get('user_id')
    const surveyId = searchParams.get('survey_id')
    const status = searchParams.get('status') as AssignmentStatus
    const companyId = searchParams.get('company_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Apply access control
    let filters: any = {}

    if (authenticatedUser.role === 'super_admin') {
      // Super admin can see all assignments
      if (companyId) filters.company_id = companyId
      if (userId) filters.user_id = userId
      if (surveyId) filters.survey_id = surveyId
      if (status) filters.status = status
    } else if (authenticatedUser.role === 'company_admin') {
      // Company admin can see assignments in their company
      filters.company_id = authenticatedUser.company_id
      if (userId) filters.user_id = userId
      if (surveyId) filters.survey_id = surveyId
      if (status) filters.status = status
    } else if (authenticatedUser.role === 'company_user') {
      // Users can only see their own assignments
      filters.user_id = authenticatedUser.id
      if (surveyId) filters.survey_id = surveyId
      if (status) filters.status = status
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Fetch assignments
    const assignments = await getAssignmentsWithDetails(filters)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAssignments = assignments.slice(startIndex, endIndex)

    return NextResponse.json({
      assignments: paginatedAssignments,
      total: assignments.length,
      page,
      limit,
      totalPages: Math.ceil(assignments.length / limit)
    })

  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE ASSIGNMENTS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body: CreateAssignmentRequest = await request.json()

    // Check if user can manage assignments
    if (!canManageAssignments(authenticatedUser.role, authenticatedUser.company_id)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create assignments' },
        { status: 403 }
      )
    }

    // Validate assignment data
    const validation = await validateAssignmentData(body, authenticatedUser.id, authenticatedUser.company_id)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Create assignments for each user
    const assignmentsToCreate = body.user_ids.map(userId => ({
      survey_id: body.survey_id,
      user_id: userId,
      assigned_by: authenticatedUser.id,
      status: 'pending' as AssignmentStatus,
      notes: body.notes || null,
      due_date: body.due_date || null,
      assigned_at: new Date().toISOString(),
      refill_count: 0
    }))

    const { data: createdAssignments, error: createError } = await supabase
      .from('survey_assignments')
      .insert(assignmentsToCreate)
      .select()

    if (createError) {
      console.error('Error creating assignments:', createError)
      return NextResponse.json(
        { error: 'Failed to create assignments' },
        { status: 500 }
      )
    }

    // Fetch created assignments with details
    const assignmentIds = createdAssignments.map(a => a.id)
    const assignmentsWithDetails = await getAssignmentsWithDetails({})
    const newAssignments = assignmentsWithDetails.filter(a => assignmentIds.includes(a.id))

    console.log('Assignments created successfully:', assignmentIds.length, 'by:', authenticatedUser.id)

    return NextResponse.json({
      assignments: newAssignments,
      count: newAssignments.length
    }, { status: 201 })

  } catch (error) {
    console.error('Create assignments error:', error)
    return NextResponse.json(
      { error: 'Failed to create assignments' },
      { status: 500 }
    )
  }
}