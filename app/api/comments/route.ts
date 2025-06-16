// app/api/comments/route.ts - Comments API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SurveyComment, CommentWithUser, CommentType, UserRole } from '@/lib'

// ============================================================================
// TYPES
// ============================================================================

interface CreateCommentRequest {
  survey_id: string
  assignment_id?: string
  recipient_id?: string
  comment_text: string
  comment_type?: CommentType
  parent_comment_id?: string
}

interface CommentsResponse {
  comments: CommentWithUser[]
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

function canAccessComments(userRole: UserRole, userCompanyId: string, userId: string, surveyCompanyId: string, commentUserId?: string, commentRecipientId?: string): boolean {
  // Super admin can access all comments
  if (userRole === 'super_admin') return true
  
  // Company admin can access comments for their company's surveys
  if (userRole === 'company_admin' && userCompanyId === surveyCompanyId) return true
  
  // Users can access comments where they are sender or recipient
  if (userRole === 'company_user') {
    return userId === commentUserId || userId === commentRecipientId
  }
  
  return false
}

async function getCommentsWithUsers(filters: {
  survey_id: string
  assignment_id?: string
  user_id?: string
  company_id?: string
} = { survey_id: '' }): Promise<CommentWithUser[]> {
  try {
    let query = supabase
      .from('survey_comments')
      .select(`
        *,
        user:users!survey_comments_user_id_fkey(
          id,
          name,
          email,
          role,
          company_id
        ),
        recipient:users!survey_comments_recipient_id_fkey(
          id,
          name,
          email,
          role,
          company_id
        )
      `)

    // Apply filters
    if (filters.survey_id) {
      query = query.eq('survey_id', filters.survey_id)
    }
    if (filters.assignment_id) {
      query = query.eq('assignment_id', filters.assignment_id)
    }
    if (filters.user_id) {
      query = query.or(`user_id.eq.${filters.user_id},recipient_id.eq.${filters.user_id}`)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    // Transform and organize comments with replies
    const commentsMap = new Map<string, CommentWithUser>()
    const rootComments: CommentWithUser[] = []

    // First pass: create all comment objects
    if (data && data.length > 0) {
      data.forEach(comment => {
        const commentWithUser: CommentWithUser = {
          ...comment,
          user: comment.user,
          recipient: comment.recipient || undefined,
          replies: []
        }
        commentsMap.set(comment.id, commentWithUser)
      })
    }

    // Second pass: organize parent-child relationships
    commentsMap.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentsMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    // Sort replies by creation date (oldest first for threaded conversation)
    rootComments.forEach(comment => {
      if (comment.replies) {
        comment.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }
    })

    return rootComments
  } catch (error) {
    console.error('Error in getCommentsWithUsers:', error)
    return []
  }
}

async function validateCommentData(data: CreateCommentRequest, userId: string, userCompanyId: string): Promise<{
  isValid: boolean
  error?: string
  survey?: any
  assignment?: any
  recipient?: any
}> {
  try {
    // Validate survey exists and user has access
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, company_id, is_active')
      .eq('id', data.survey_id)
      .single()

    if (surveyError || !survey) {
      return { isValid: false, error: 'Survey not found' }
    }

    // Check if user has access to this survey's company
    if (userCompanyId !== survey.company_id) {
      return { isValid: false, error: 'No access to this survey' }
    }

    // Validate assignment if provided
    let assignment = null
    if (data.assignment_id) {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('*')
        .eq('id', data.assignment_id)
        .eq('survey_id', data.survey_id)
        .single()

      if (assignmentError || !assignmentData) {
        return { isValid: false, error: 'Assignment not found' }
      }

      assignment = assignmentData
    }

    // Validate recipient if provided
    let recipient = null
    if (data.recipient_id) {
      const { data: recipientData, error: recipientError } = await supabase
        .from('users')
        .select('id, name, email, company_id, role, is_active')
        .eq('id', data.recipient_id)
        .eq('is_active', true)
        .single()

      if (recipientError || !recipientData) {
        return { isValid: false, error: 'Recipient not found' }
      }

      // Check if recipient is in the same company
      if (recipientData.company_id !== userCompanyId) {
        return { isValid: false, error: 'Cannot send comments to users in other companies' }
      }

      recipient = recipientData
    }

    // Validate parent comment if provided
    if (data.parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('survey_comments')
        .select('id, survey_id, user_id')
        .eq('id', data.parent_comment_id)
        .eq('survey_id', data.survey_id)
        .single()

      if (parentError || !parentComment) {
        return { isValid: false, error: 'Parent comment not found' }
      }
    }

    // Validate comment text
    if (!data.comment_text || data.comment_text.trim().length === 0) {
      return { isValid: false, error: 'Comment text is required' }
    }

    if (data.comment_text.trim().length > 2000) {
      return { isValid: false, error: 'Comment text must be less than 2000 characters' }
    }

    return { isValid: true, survey, assignment, recipient }
  } catch (error) {
    console.error('Error validating comment data:', error)
    return { isValid: false, error: 'Failed to validate comment data' }
  }
}

// ============================================================================
// GET COMMENTS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const surveyId = searchParams.get('survey_id')
    const assignmentId = searchParams.get('assignment_id')
    const userId = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Get survey to check permissions
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, company_id')
      .eq('id', surveyId)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canAccessComments(
      authenticatedUser.role, 
      authenticatedUser.company_id, 
      authenticatedUser.id, 
      survey.company_id
    )) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access comments' },
        { status: 403 }
      )
    }

    // Apply filters based on user role
    const filters: any = { survey_id: surveyId }
    
    if (assignmentId) filters.assignment_id = assignmentId
    
    // For company users, only show comments they're involved in
    if (authenticatedUser.role === 'company_user') {
      filters.user_id = authenticatedUser.id
    } else if (userId) {
      filters.user_id = userId
    }

    // Fetch comments
    const comments = await getCommentsWithUsers(filters)

    // Apply pagination to root comments only
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedComments = comments.slice(startIndex, endIndex)

    const response: CommentsResponse = {
      comments: paginatedComments,
      total: comments.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE COMMENT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body: CreateCommentRequest = await request.json()

    // Validate comment data
    const validation = await validateCommentData(body, authenticatedUser.id, authenticatedUser.company_id)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Create comment
    const commentData = {
      survey_id: body.survey_id,
      assignment_id: body.assignment_id || null,
      user_id: authenticatedUser.id,
      recipient_id: body.recipient_id || null,
      comment_text: body.comment_text.trim(),
      comment_type: body.comment_type || 'general',
      is_read: false,
      parent_comment_id: body.parent_comment_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newComment, error: commentError } = await supabase
      .from('survey_comments')
      .insert(commentData)
      .select()
      .single()

    if (commentError) {
      console.error('Error creating comment:', commentError)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Fetch the created comment with user details
    const comments = await getCommentsWithUsers({ 
      survey_id: body.survey_id,
      assignment_id: body.assignment_id 
    })
    const createdComment = comments.find(c => c.id === newComment.id) || 
                          comments.flatMap(c => c.replies || []).find(c => c.id === newComment.id)

    if (!createdComment) {
      return NextResponse.json(
        { error: 'Comment created but failed to fetch comment data' },
        { status: 500 }
      )
    }

    console.log('Comment created successfully:', newComment.id, 'by:', authenticatedUser.id)

    return NextResponse.json({
      comment: createdComment
    }, { status: 201 })

  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Comments endpoint is active',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}