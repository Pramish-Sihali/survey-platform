// app/api/survey-assignments/[id]/route.ts - Fixed Assignment Detail API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SurveyAssignment, SurveyAssignmentWithDetails, AssignmentStatus, UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface UpdateAssignmentRequest {
  status?: AssignmentStatus
  notes?: string
  due_date?: string
}

interface RefillRequest {
  reason?: string
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

async function getAssignmentWithDetails(assignmentId: string): Promise<SurveyAssignmentWithDetails | null> {
  try {
    const { data, error } = await supabase
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
      .eq('id', assignmentId)
      .single()

    if (error || !data) {
      console.error('Error fetching assignment:', error)
      return null
    }

    return {
      ...data,
      survey_title: data.surveys?.title || 'Unknown Survey',
      survey_description: data.surveys?.description || null,
      user_name: data.users?.name || 'Unknown User',
      user_email: data.users?.email || 'Unknown Email',
      assigned_by_name: data.assigned_by_user?.name || 'Unknown Admin',
      company_name: 'Company' // Could be enhanced to fetch actual company name
    } as SurveyAssignmentWithDetails
  } catch (error) {
    console.error('Error in getAssignmentWithDetails:', error)
    return null
  }
}

function canAccessAssignment(userRole: UserRole, userCompanyId: string, userId: string, assignment: SurveyAssignmentWithDetails): boolean {
  // Super admin can access all assignments
  if (userRole === 'super_admin') return true
  
  // Company admin can access assignments in their company
  if (userRole === 'company_admin' && userCompanyId === assignment.surveys?.company_id) return true
  
  // Users can access their own assignments
  if (userRole === 'company_user' && userId === assignment.user_id) return true
  
  return false
}

function canManageAssignment(userRole: UserRole, userCompanyId: string, assignment: SurveyAssignmentWithDetails): boolean {
  // Super admin can manage all assignments
  if (userRole === 'super_admin') return true
  
  // Company admin can manage assignments in their company
  if (userRole === 'company_admin' && userCompanyId === assignment.surveys?.company_id) return true
  
  return false
}

// ============================================================================
// GET ASSIGNMENT BY ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: assignmentId } = await params

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Fetch assignment with details
    const assignment = await getAssignmentWithDetails(assignmentId)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canAccessAssignment(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, assignment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this assignment' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      assignment
    })

  } catch (error) {
    console.error('Get assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE ASSIGNMENT
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: assignmentId } = await params
    const body: UpdateAssignmentRequest = await request.json()

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing assignment
    const existingAssignment = await getAssignmentWithDetails(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canManageAssignment(authenticatedUser.role, authenticatedUser.company_id, existingAssignment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this assignment' },
        { status: 403 }
      )
    }

    // Validate status transitions
    if (body.status && body.status !== existingAssignment.status) {
      const validTransitions: Record<AssignmentStatus, AssignmentStatus[]> = {
        pending: ['in_progress', 'completed'],
        in_progress: ['completed', 'pending'],
        completed: ['refill_requested'],
        refill_requested: ['pending', 'completed']
      }

      const allowedStatuses = validTransitions[existingAssignment.status] || []
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot change status from ${existingAssignment.status} to ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Validate due date
    if (body.due_date) {
      const dueDate = new Date(body.due_date)
      const now = new Date()
      
      if (dueDate <= now) {
        return NextResponse.json(
          { error: 'Due date must be in the future' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.due_date !== undefined) updateData.due_date = body.due_date

    // Special handling for completed status
    if (body.status === 'completed' && existingAssignment.status !== 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else if (body.status !== 'completed' && existingAssignment.status === 'completed') {
      updateData.completed_at = null
    }

    // Update assignment
    const { error: updateError } = await supabase
      .from('survey_assignments')
      .update(updateData)
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Error updating assignment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      )
    }

    // Fetch updated assignment
    const updatedAssignment = await getAssignmentWithDetails(assignmentId)
    if (!updatedAssignment) {
      return NextResponse.json(
        { error: 'Assignment updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    console.log('Assignment updated successfully:', assignmentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      assignment: updatedAssignment
    })

  } catch (error) {
    console.error('Update assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE ASSIGNMENT
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: assignmentId } = await params

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing assignment
    const existingAssignment = await getAssignmentWithDetails(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canManageAssignment(authenticatedUser.role, authenticatedUser.company_id, existingAssignment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this assignment' },
        { status: 403 }
      )
    }

    // Check if assignment has responses
    const { count: responseCount } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact' })
      .eq('assignment_id', assignmentId)

    if (responseCount && responseCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete assignment with ${responseCount} responses` },
        { status: 400 }
      )
    }

    // Delete assignment
    const { error: deleteError } = await supabase
      .from('survey_assignments')
      .delete()
      .eq('id', assignmentId)

    if (deleteError) {
      console.error('Error deleting assignment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete assignment' },
        { status: 500 }
      )
    }

    console.log('Assignment deleted successfully:', assignmentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'Assignment deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// REQUEST REFILL
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: assignmentId } = await params
    const body: RefillRequest = await request.json()

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing assignment
    const existingAssignment = await getAssignmentWithDetails(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check permissions (users can request refill for their own assignments)
    if (!canAccessAssignment(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, existingAssignment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to request refill for this assignment' },
        { status: 403 }
      )
    }

    // Check if survey allows refills
    if (!existingAssignment.surveys?.allows_refill) {
      return NextResponse.json(
        { error: 'Survey does not allow refills' },
        { status: 400 }
      )
    }

    // Check if assignment is completed
    if (existingAssignment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only request refill for completed assignments' },
        { status: 400 }
      )
    }

    // Update assignment status and increment refill count
    const { error: updateError } = await supabase
      .from('survey_assignments')
      .update({
        status: 'refill_requested',
        refill_count: existingAssignment.refill_count + 1,
        notes: body.reason ? `Refill requested: ${body.reason}` : 'Refill requested'
      })
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Error requesting refill:', updateError)
      return NextResponse.json(
        { error: 'Failed to request refill' },
        { status: 500 }
      )
    }

    // Fetch updated assignment
    const updatedAssignment = await getAssignmentWithDetails(assignmentId)

    console.log('Refill requested successfully:', assignmentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      assignment: updatedAssignment,
      message: 'Refill requested successfully'
    })

  } catch (error) {
    console.error('Request refill error:', error)
    return NextResponse.json(
      { error: 'Failed to request refill' },
      { status: 500 }
    )
  }
}