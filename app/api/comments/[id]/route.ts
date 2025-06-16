// app/api/comments/[id]/route.ts - Fixed Comment Detail API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SurveyComment, CommentWithUser, UserRole } from '@/lib'

// ============================================================================
// TYPES
// ============================================================================

interface UpdateCommentRequest {
  comment_text?: string
  is_read?: boolean
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

async function getCommentWithDetails(commentId: string): Promise<CommentWithUser | null> {
  try {
    const { data, error } = await supabase
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
        ),
        surveys!survey_comments_survey_id_fkey(
          id,
          title,
          company_id
        )
      `)
      .eq('id', commentId)
      .single()

    if (error || !data) {
      console.error('Error fetching comment:', error)
      return null
    }

    return {
      ...data,
      user: data.user,
      recipient: data.recipient || undefined,
      replies: [] // Individual comment fetch doesn't include replies
    } as CommentWithUser
  } catch (error) {
    console.error('Error in getCommentWithDetails:', error)
    return null
  }
}

function canAccessComment(userRole: UserRole, userCompanyId: string, userId: string, comment: any): boolean {
  // Super admin can access all comments
  if (userRole === 'super_admin') return true
  
  // Company admin can access comments for their company's surveys
  if (userRole === 'company_admin' && userCompanyId === comment.surveys?.company_id) return true
  
  // Users can access comments where they are sender or recipient
  if (userRole === 'company_user') {
    return userId === comment.user_id || userId === comment.recipient_id
  }
  
  return false
}

function canModifyComment(userRole: UserRole, userCompanyId: string, userId: string, comment: any): boolean {
  // Super admin can modify all comments
  if (userRole === 'super_admin') return true
  
  // Company admin can modify comments for their company's surveys
  if (userRole === 'company_admin' && userCompanyId === comment.surveys?.company_id) return true
  
  // Users can only modify their own comments
  if (userRole === 'company_user' && userId === comment.user_id) return true
  
  return false
}

function canMarkAsRead(userRole: UserRole, userCompanyId: string, userId: string, comment: any): boolean {
  // Super admin can mark any comment as read
  if (userRole === 'super_admin') return true
  
  // Company admin can mark comments as read for their company's surveys
  if (userRole === 'company_admin' && userCompanyId === comment.surveys?.company_id) return true
  
  // Users can mark comments as read if they are the recipient
  if (userRole === 'company_user' && userId === comment.recipient_id) return true
  
  return false
}

// ============================================================================
// GET COMMENT BY ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: commentId } = await params

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Fetch comment with details
    const comment = await getCommentWithDetails(commentId)
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canAccessComment(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, comment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access this comment' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      comment
    })

  } catch (error) {
    console.error('Get comment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE COMMENT
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: commentId } = await params
    const body: UpdateCommentRequest = await request.json()

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing comment
    const existingComment = await getCommentWithDetails(commentId)
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions for text modification
    if (body.comment_text !== undefined) {
      if (!canModifyComment(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, existingComment)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to modify this comment' },
          { status: 403 }
        )
      }

      // Validate comment text
      if (!body.comment_text || body.comment_text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Comment text cannot be empty' },
          { status: 400 }
        )
      }

      if (body.comment_text.trim().length > 2000) {
        return NextResponse.json(
          { error: 'Comment text must be less than 2000 characters' },
          { status: 400 }
        )
      }

      // Don't allow editing old comments (more than 24 hours old)
      const commentAge = Date.now() - new Date(existingComment.created_at).getTime()
      const maxEditTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      if (commentAge > maxEditTime && authenticatedUser.role === 'company_user') {
        return NextResponse.json(
          { error: 'Comments can only be edited within 24 hours of creation' },
          { status: 400 }
        )
      }
    }

    // Check permissions for marking as read
    if (body.is_read !== undefined) {
      if (!canMarkAsRead(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, existingComment)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to mark this comment as read' },
          { status: 403 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.comment_text !== undefined) {
      updateData.comment_text = body.comment_text.trim()
    }

    if (body.is_read !== undefined) {
      updateData.is_read = body.is_read
    }

    // Update comment
    const { error: updateError } = await supabase
      .from('survey_comments')
      .update(updateData)
      .eq('id', commentId)

    if (updateError) {
      console.error('Error updating comment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    // Fetch updated comment
    const updatedComment = await getCommentWithDetails(commentId)
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    console.log('Comment updated successfully:', commentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      comment: updatedComment
    })

  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE COMMENT
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: commentId } = await params

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing comment
    const existingComment = await getCommentWithDetails(commentId)
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canModifyComment(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, existingComment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this comment' },
        { status: 403 }
      )
    }

    // Check if comment has replies
    const { count: replyCount } = await supabase
      .from('survey_comments')
      .select('id', { count: 'exact' })
      .eq('parent_comment_id', commentId)

    if (replyCount && replyCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete comment with ${replyCount} replies` },
        { status: 400 }
      )
    }

    // Don't allow deleting old comments (more than 24 hours old) for regular users
    const commentAge = Date.now() - new Date(existingComment.created_at).getTime()
    const maxDeleteTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    if (commentAge > maxDeleteTime && authenticatedUser.role === 'company_user') {
      return NextResponse.json(
        { error: 'Comments can only be deleted within 24 hours of creation' },
        { status: 400 }
      )
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from('survey_comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    console.log('Comment deleted successfully:', commentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'Comment deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// MARK AS READ (PATCH)
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { id: commentId } = await params

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Fetch existing comment
    const existingComment = await getCommentWithDetails(commentId)
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (!canMarkAsRead(authenticatedUser.role, authenticatedUser.company_id, authenticatedUser.id, existingComment)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to mark this comment as read' },
        { status: 403 }
      )
    }

    // Mark as read
    const { error: updateError } = await supabase
      .from('survey_comments')
      .update({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)

    if (updateError) {
      console.error('Error marking comment as read:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark comment as read' },
        { status: 500 }
      )
    }

    // Fetch updated comment
    const updatedComment = await getCommentWithDetails(commentId)

    console.log('Comment marked as read:', commentId, 'by:', authenticatedUser.id)

    return NextResponse.json({
      comment: updatedComment,
      message: 'Comment marked as read'
    })

  } catch (error) {
    console.error('Mark comment as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark comment as read' },
      { status: 500 }
    )
  }
}