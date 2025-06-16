'use client'

// components/comments/CommentForm.tsx - Comment Form Component
import { useState } from 'react'
import { ApiClient, CommentType, UserWithProfile } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface CommentFormProps {
  surveyId: string
  assignmentId?: string | null
  parentCommentId?: string
  recipientId?: string
  onSuccess: () => void
  onCancel?: () => void
  placeholder?: string
  compact?: boolean
  className?: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommentForm({
  surveyId,
  assignmentId,
  parentCommentId,
  recipientId,
  onSuccess,
  onCancel,
  placeholder = "Write your comment...",
  compact = false,
  className
}: CommentFormProps) {
  // State management
  const [commentText, setCommentText] = useState('')
  const [commentType, setCommentType] = useState<CommentType>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (commentText.trim().length > 2000) {
      setError('Comment must be less than 2000 characters')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await ApiClient.createComment({
        survey_id: surveyId,
        assignment_id: assignmentId,
        parent_comment_id: parentCommentId,
        recipient_id: recipientId,
        comment_text: commentText.trim(),
        comment_type: commentType
      })

      // Reset form
      setCommentText('')
      setCommentType('general')
      
      // Call success callback
      onSuccess()
    } catch (error) {
      console.error('Error creating comment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setCommentText('')
    setCommentType('general')
    setError('')
    if (onCancel) {
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getCommentTypeColor = (type: CommentType) => {
    switch (type) {
      case 'clarification': return 'text-blue-600'
      case 'feedback': return 'text-green-600'
      case 'refill_request': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getCommentTypeIcon = (type: CommentType) => {
    switch (type) {
      case 'clarification': return <QuestionIcon className="w-4 h-4" />
      case 'feedback': return <FeedbackIcon className="w-4 h-4" />
      case 'refill_request': return <RefreshIcon className="w-4 h-4" />
      default: return <CommentIcon className="w-4 h-4" />
    }
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-3", className)}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-4 h-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Comment Type Selection (if not compact) */}
        {!compact && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['general', 'clarification', 'feedback', 'refill_request'] as CommentType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCommentType(type)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                    commentType === type
                      ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {getCommentTypeIcon(type)}
                  <span>{type.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {parentCommentId ? 'Reply' : 'Comment'}
          </label>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={compact ? 2 : 4}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 resize-vertical"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              {compact ? 'Cmd/Ctrl + Enter to send' : 'Press Cmd/Ctrl + Enter to send quickly'}
            </p>
            <p className="text-xs text-gray-500">
              {commentText.length}/2000
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              compact ? "flex-1" : "",
              isSubmitting || !commentText.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            )}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                <span>{parentCommentId ? 'Reply' : 'Post Comment'}</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Selected comment type indicator */}
        {commentType !== 'general' && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Type:</span>
            <span className={cn("flex items-center gap-1 font-medium", getCommentTypeColor(commentType))}>
              {getCommentTypeIcon(commentType)}
              {commentType.replace('_', ' ')}
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const CommentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const QuestionIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FeedbackIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
)

const RefreshIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const SendIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const AlertIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const LoadingSpinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)