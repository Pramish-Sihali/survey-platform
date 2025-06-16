'use client'

// components/admin/SurveyAssignment.tsx - Survey Assignment Component
import { useState, useEffect } from 'react'
import { ApiClient, Survey, UserWithProfile, SurveyAssignmentWithDetails, AssignmentStatus } from '@/lib/'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface SurveyAssignmentProps {
  className?: string
}

interface AssignmentFormData {
  survey_id: string
  user_ids: string[]
  notes: string
  due_date: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SurveyAssignment({ className }: SurveyAssignmentProps) {
  // State management
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [assignments, setAssignments] = useState<SurveyAssignmentWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState<AssignmentFormData>({
    survey_id: '',
    user_ids: [],
    notes: '',
    due_date: ''
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all')
  const [surveyFilter, setSurveyFilter] = useState<string>('all')

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [surveysRes, usersRes, assignmentsRes] = await Promise.all([
        ApiClient.getSurveys(),
        ApiClient.getUsers(),
        ApiClient.getAssignments()
      ])

      setSurveys(surveysRes.surveys || [])
      setAssignments(assignmentsRes.assignments || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.survey_id || formData.user_ids.length === 0) {
      setError('Please select a survey and at least one user')
      return
    }

    try {
      setIsCreating(true)
      setError('')

      await ApiClient.createAssignments({
        survey_id: formData.survey_id,
        user_ids: formData.user_ids,
        notes: formData.notes || undefined,
        due_date: formData.due_date || undefined
      })

      setSuccessMessage(`Assignment created for ${formData.user_ids.length} user(s)`)
      setShowCreateForm(false)
      setFormData({
        survey_id: '',
        user_ids: [],
        notes: '',
        due_date: ''
      })

      // Reload assignments
      const assignmentsRes = await ApiClient.getAssignments()
      setAssignments(assignmentsRes.assignments || [])
    } catch (error) {
      console.error('Error creating assignment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create assignment')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUserSelection = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      user_ids: checked 
        ? [...prev.user_ids, userId]
        : prev.user_ids.filter(id => id !== userId)
    }))
  }

  const handleUpdateAssignmentStatus = async (assignmentId: string, status: AssignmentStatus) => {
    try {
      await ApiClient.updateAssignment(assignmentId, { status })
      
      // Update local state
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status }
            : assignment
        )
      )

      setSuccessMessage('Assignment status updated')
    } catch (error) {
      console.error('Error updating assignment:', error)
      setError('Failed to update assignment status')
    }
  }

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter !== 'all' && assignment.status !== statusFilter) return false
    if (surveyFilter !== 'all' && assignment.survey_id !== surveyFilter) return false
    return true
  })

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'refill_requested': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-gray-600">
              <LoadingSpinner />
              <span>Loading assignments...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Assignments</h2>
          <p className="text-gray-600 mt-1">Assign surveys to specific users and track completion</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" />
          New Assignment
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-4 h-4 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Create Assignment Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Assignment</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            {/* Survey Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Survey *
              </label>
              <select
                value={formData.survey_id}
                onChange={(e) => setFormData(prev => ({ ...prev, survey_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
                required
              >
                <option value="">Choose a survey...</option>
                {surveys
                  .filter(survey => survey.is_active && survey.is_published)
                  .map(survey => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Users * ({formData.user_ids.length} selected)
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.user_ids.includes(user.id)}
                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-200"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {user.designation && (
                        <div className="text-xs text-gray-500">{user.designation}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional instructions or notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Assignment'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'all')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="refill_requested">Refill Requested</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey</label>
            <select
              value={surveyFilter}
              onChange={(e) => setSurveyFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
            >
              <option value="all">All Surveys</option>
              {surveys.map(survey => (
                <option key={survey.id} value={survey.id}>
                  {survey.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Assignments ({filteredAssignments.length})
          </h3>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AssignmentIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No assignments found</p>
            {assignments.length === 0 && (
              <p className="text-sm mt-1">Create your first survey assignment to get started</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{assignment.user_name}</div>
                        <div className="text-sm text-gray-600">{assignment.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{assignment.survey_title}</div>
                        {assignment.survey_description && (
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {assignment.survey_description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(assignment.status)
                      )}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(assignment.assigned_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {assignment.due_date ? formatDate(assignment.due_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {assignment.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(assignment.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Start
                          </button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(assignment.id, 'completed')}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Complete
                          </button>
                        )}
                        {assignment.status === 'refill_requested' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(assignment.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-800 font-medium"
                          >
                            Approve Refill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const AlertIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const CloseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const AssignmentIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const LoadingSpinner = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)