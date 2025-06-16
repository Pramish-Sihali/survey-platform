// app/api/surveys/[id]/refill/route.ts - Fixed Survey Refill API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface RefillRequestBody {
  user_id?: string
  assignment_id?: string
  reason?: string
  admin_notes?: string
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

async function validateRefillRequest(surveyId: string, userId: string, assignmentId?: string): Promise<{
  isValid: boolean
  error?: string
  survey?: any
  assignment?: any
  existingResponse?: any
}> {
  try {
    // Check if survey exists and allows refills
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .eq('is_active', true)
      .single()

    if (surveyError || !survey) {
      return { isValid: false, error: 'Survey not found or inactive' }
    }

    if (!survey.allows_refill) {
      return { isValid: false, error: 'Survey does not allow refills' }
    }

    // Check if user has a completed response
    const { data: existingResponse, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    if (responseError || !existingResponse) {
      return { isValid: false, error: 'No existing response found for this user' }
    }

    // Validate assignment if provided
    let assignment = null
    if (assignmentId) {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('*')
        .eq('id', assignmentId)
        .eq('survey_id', surveyId)
        .eq('user_id', userId)
        .single()

      if (assignmentError || !assignmentData) {
        return { isValid: false, error: 'Assignment not found' }
      }

      if (assignmentData.status !== 'completed') {
        return { isValid: false, error: 'Assignment must be completed before requesting refill' }
      }

      assignment = assignmentData
    }

    return { isValid: true, survey, assignment, existingResponse }
  } catch (error) {
    console.error('Error validating refill request:', error)
    return { isValid: false, error: 'Failed to validate refill request' }
  }
}

// ============================================================================
// REQUEST SURVEY REFILL
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: surveyId } = await params
    const body: RefillRequestBody = await request.json()

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Determine target user (self for users, specified user for admins)
    let targetUserId = authenticatedUser.id
    if (body.user_id && authenticatedUser.role !== 'company_user') {
      targetUserId = body.user_id
    }

    // Validate the refill request
    const validation = await validateRefillRequest(surveyId, targetUserId, body.assignment_id)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check permissions
    if (authenticatedUser.role === 'company_user') {
      // Users can only request refills for themselves
      if (targetUserId !== authenticatedUser.id) {
        return NextResponse.json(
          { error: 'Users can only request refills for themselves' },
          { status: 403 }
        )
      }
    } else {
      // Admins can request refills for users in their company
      const { data: targetUser } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', targetUserId)
        .single()

      if (!targetUser || (authenticatedUser.role === 'company_admin' && targetUser.company_id !== authenticatedUser.company_id)) {
        return NextResponse.json(
          { error: 'No permission to request refill for this user' },
          { status: 403 }
        )
      }
    }

    // Check cooldown period (prevent spam requests)
    const cooldownHours = 24 // 24 hours between refill requests
    const { data: recentRefill } = await supabase
      .from('survey_responses')
      .select('submitted_at')
      .eq('survey_id', surveyId)
      .eq('user_id', targetUserId)
      .eq('is_refill', true)
      .gte('submitted_at', new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single()

    if (recentRefill) {
      return NextResponse.json(
        { error: `Please wait ${cooldownHours} hours between refill requests` },
        { status: 429 }
      )
    }

    // Calculate refill attempt number
    const { count: refillCount } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact' })
      .eq('survey_id', surveyId)
      .eq('user_id', targetUserId)

    const nextAttempt = (refillCount || 0) + 1

    // Update assignment status if assignment provided
    if (body.assignment_id) {
      const { error: assignmentUpdateError } = await supabase
        .from('survey_assignments')
        .update({
          status: 'refill_requested',
          refill_count: validation.assignment?.refill_count + 1 || 1,
          notes: body.reason ? `Refill requested: ${body.reason}` : 'Refill requested'
        })
        .eq('id', body.assignment_id)

      if (assignmentUpdateError) {
        console.error('Error updating assignment:', assignmentUpdateError)
        // Don't fail the refill request for this
      }
    }

    // Create a comment about the refill request
    const commentData = {
      survey_id: surveyId,
      assignment_id: body.assignment_id || null,
      user_id: authenticatedUser.id,
      recipient_id: authenticatedUser.role === 'company_user' ? null : targetUserId,
      comment_text: body.reason || 'Refill requested for this survey',
      comment_type: 'refill_request' as const,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: commentError } = await supabase
      .from('survey_comments')
      .insert(commentData)

    if (commentError) {
      console.error('Error creating refill comment:', commentError)
      // Don't fail the refill request for this
    }

    // Log the refill request for admin tracking
    const refillLogData = {
      survey_id: surveyId,
      user_id: targetUserId,
      assignment_id: body.assignment_id || null,
      requested_by: authenticatedUser.id,
      reason: body.reason || null,
      admin_notes: body.admin_notes || null,
      attempt_number: nextAttempt,
      requested_at: new Date().toISOString()
    }

    // Note: This would require a refill_requests table in production
    // For now, we'll track via assignment status and comments

    console.log('Refill requested successfully:', {
      surveyId,
      userId: targetUserId,
      requestedBy: authenticatedUser.id,
      attempt: nextAttempt
    })

    return NextResponse.json({
      message: 'Refill request submitted successfully',
      survey_id: surveyId,
      user_id: targetUserId,
      attempt_number: nextAttempt,
      status: body.assignment_id ? 'refill_requested' : 'pending_approval',
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('Refill request error:', error)
    return NextResponse.json(
      { error: 'Failed to process refill request' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET REFILL HISTORY
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: surveyId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Check survey access
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('company_id')
      .eq('id', surveyId)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Apply access control
    let targetUserId = authenticatedUser.id
    
    if (userId && authenticatedUser.role !== 'company_user') {
      // Admins can view refill history for users in their company
      const { data: targetUser } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single()

      if (!targetUser || (authenticatedUser.role === 'company_admin' && targetUser.company_id !== authenticatedUser.company_id)) {
        return NextResponse.json(
          { error: 'No permission to view refill history for this user' },
          { status: 403 }
        )
      }

      targetUserId = userId
    }

    // Get all responses for this user and survey
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey_assignments!survey_responses_assignment_id_fkey(
          id,
          status,
          assigned_at,
          due_date,
          refill_count
        )
      `)
      .eq('survey_id', surveyId)
      .eq('user_id', targetUserId)
      .order('submitted_at', { ascending: false })

    if (responsesError) {
      console.error('Error fetching refill history:', responsesError)
      return NextResponse.json(
        { error: 'Failed to fetch refill history' },
        { status: 500 }
      )
    }

    // Get related comments for context
    const { data: comments } = await supabase
      .from('survey_comments')
      .select(`
        *,
        user:users!survey_comments_user_id_fkey(name, email)
      `)
      .eq('survey_id', surveyId)
      .eq('comment_type', 'refill_request')
      .or(`user_id.eq.${targetUserId},recipient_id.eq.${targetUserId}`)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      survey_id: surveyId,
      user_id: targetUserId,
      total_attempts: responses?.length || 0,
      refill_attempts: responses?.filter(r => r.is_refill).length || 0,
      responses: responses || [],
      refill_comments: comments || []
    })

  } catch (error) {
    console.error('Get refill history error:', error)
    return NextResponse.json(
      { error: 'Failed to get refill history' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Survey refill endpoint is active',
    methods: ['POST', 'GET'],
    timestamp: new Date().toISOString()
  })
}