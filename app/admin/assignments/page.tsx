// app/admin/assignments/page.tsx - Survey Assignment Management
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Users,
  Calendar,
  BarChart3,
  FileText,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { ApiClient, UserWithProfile, SurveyAssignmentWithDetails, AssignmentStatus, Survey, SafeUserWithProfile } from '@/lib'

interface AssignmentStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  refillRequested: number
  overdue: number
}

export default function AdminAssignmentsPage() {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [assignments, setAssignments] = useState<SurveyAssignmentWithDetails[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<SurveyAssignmentWithDetails[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [users, setUsers] = useState<SafeUserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus>('all')
  const [surveyFilter, setSurveyFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'due_soon' | 'no_due_date'>('all')
  
  // Selection and bulk actions
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    refillRequested: 0,
    overdue: 0
  })

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    getUser()
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch assignments for company
        const assignmentsResponse = await ApiClient.getAssignments({
          company_id: user.company_id || undefined,
          page: 1,
          limit: 500
        })
        setAssignments(assignmentsResponse.assignments)
        
        // Fetch surveys for dropdown
        const surveysResponse = await ApiClient.getSurveys({
          company_id: user.company_id || undefined,
          is_active: true
        })
        setSurveys(surveysResponse.surveys)
        
        // Fetch users for dropdown
        const usersResponse = await ApiClient.getUsers({
          company_id: user.company_id || undefined,
          is_active: true
        })
        setUsers(usersResponse.users)
        
        // Calculate stats
        calculateStats(assignmentsResponse.assignments)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load assignments')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  // Calculate assignment statistics
  const calculateStats = (assignmentsList: SurveyAssignmentWithDetails[]) => {
    const total = assignmentsList.length
    const pending = assignmentsList.filter(a => a.status === 'pending').length
    const inProgress = assignmentsList.filter(a => a.status === 'in_progress').length
    const completed = assignmentsList.filter(a => a.status === 'completed').length
    const refillRequested = assignmentsList.filter(a => a.status === 'refill_requested').length
    
    // Calculate overdue assignments
    const now = new Date()
    const overdue = assignmentsList.filter(a => 
      a.due_date && 
      new Date(a.due_date) < now && 
      !['completed', 'refill_requested'].includes(a.status)
    ).length
    
    setStats({
      total,
      pending,
      inProgress,
      completed,
      refillRequested,
      overdue
    })
  }

  // Filter assignments
  useEffect(() => {
    let filtered = assignments

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(assignment => 
        assignment.survey_title.toLowerCase().includes(term) ||
        assignment.user_name.toLowerCase().includes(term) ||
        assignment.user_email.toLowerCase().includes(term) ||
        (assignment.notes && assignment.notes.toLowerCase().includes(term))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter)
    }

    // Survey filter
    if (surveyFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.survey_id === surveyFilter)
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.user_id === userFilter)
    }

    // Due date filter
    if (dueDateFilter !== 'all') {
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(assignment => {
        if (dueDateFilter === 'overdue') {
          return assignment.due_date && 
                 new Date(assignment.due_date) < now && 
                 !['completed', 'refill_requested'].includes(assignment.status)
        }
        if (dueDateFilter === 'due_soon') {
          return assignment.due_date && 
                 new Date(assignment.due_date) <= threeDaysFromNow && 
                 new Date(assignment.due_date) >= now
        }
        if (dueDateFilter === 'no_due_date') {
          return !assignment.due_date
        }
        return true
      })
    }

    setFilteredAssignments(filtered)
  }, [assignments, searchTerm, statusFilter, surveyFilter, userFilter, dueDateFilter])

  // Handle assignment selection
  const handleAssignmentSelect = (assignmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssignments(prev => [...prev, assignmentId])
    } else {
      setSelectedAssignments(prev => prev.filter(id => id !== assignmentId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssignments(filteredAssignments.map(assignment => assignment.id))
    } else {
      setSelectedAssignments([])
    }
  }

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedAssignments.length === 0) return

    try {
      setLoading(true)
      
      switch (bulkAction) {
        case 'complete':
          // Bulk complete assignments
          for (const assignmentId of selectedAssignments) {
            await ApiClient.updateAssignment(assignmentId, { status: 'completed' })
          }
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedAssignments.length} assignments?`)) {
            for (const assignmentId of selectedAssignments) {
              await ApiClient.deleteAssignment(assignmentId)
            }
          }
          break
        case 'export':
          // Export selected assignments
          console.log('Export assignments:', selectedAssignments)
          break
      }
      
      setSelectedAssignments([])
      setBulkAction('')
      
      // Refresh data
      window.location.reload()
    } catch (err) {
      console.error('Bulk action error:', err)
      alert('Failed to perform bulk action')
    } finally {
      setLoading(false)
    }
  }

  // Handle individual assignment actions
  const handleAssignmentAction = async (assignmentId: string, action: string) => {
    try {
      switch (action) {
        case 'complete':
          await ApiClient.updateAssignment(assignmentId, { status: 'completed' })
          break
        case 'reset':
          await ApiClient.updateAssignment(assignmentId, { status: 'pending' })
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this assignment?')) {
            await ApiClient.deleteAssignment(assignmentId)
          }
          break
      }
      
      // Refresh assignments
      window.location.reload()
    } catch (err) {
      console.error('Assignment action error:', err)
      alert('Failed to perform action')
    }
  }

  // Helper functions
  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'refill_requested': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in_progress': return <RefreshCw className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'refill_requested': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusName = (status: AssignmentStatus) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'refill_requested': return 'Refill Requested'
      default: return status
    }
  }

  const isOverdue = (assignment: SurveyAssignmentWithDetails) => {
    if (!assignment.due_date || ['completed', 'refill_requested'].includes(assignment.status)) {
      return false
    }
    return new Date(assignment.due_date) < new Date()
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return `${Math.abs(diffInDays)} days overdue`
    if (diffInDays === 0) return 'Due today'
    if (diffInDays === 1) return 'Due tomorrow'
    return `Due in ${diffInDays} days`
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading user</div>
  }

  if (loading) {
    return (
      <AuthenticatedLayout user={user}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout user={user}>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error Loading Assignments</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Assignments</h1>
            <p className="text-gray-600 mt-2">
              Manage and track survey assignments for your team
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/admin/assignments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refill Requests</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.refillRequested}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refill_requested">Refill Requested</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Survey" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Surveys</SelectItem>
                    {surveys.map(survey => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dueDateFilter} onValueChange={(value: any) => setDueDateFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Due Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="due_soon">Due Soon</SelectItem>
                    <SelectItem value="no_due_date">No Due Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedAssignments.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Bulk actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Mark Complete</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                  >
                    Apply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedAssignments([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assignments ({filteredAssignments.length})</CardTitle>
                <CardDescription>
                  Survey assignments and their current status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || surveyFilter !== 'all' || userFilter !== 'all' || dueDateFilter !== 'all'
                    ? 'No assignments match your filters' 
                    : 'No assignments found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || surveyFilter !== 'all' || userFilter !== 'all' || dueDateFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating your first assignment'}
                </p>
                {!searchTerm && statusFilter === 'all' && surveyFilter === 'all' && userFilter === 'all' && dueDateFilter === 'all' && (
                  <Link href="/admin/assignments/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        <Checkbox
                          checked={selectedAssignments.length === filteredAssignments.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left p-3 font-medium">Survey</th>
                      <th className="text-left p-3 font-medium">Assignee</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Assigned</th>
                      <th className="text-left p-3 font-medium">Due Date</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedAssignments.includes(assignment.id)}
                            onCheckedChange={(checked) => handleAssignmentSelect(assignment.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900">{assignment.survey_title}</p>
                            {assignment.survey_description && (
                              <p className="text-sm text-gray-600 truncate max-w-xs">
                                {assignment.survey_description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{assignment.user_name}</p>
                              <p className="text-sm text-gray-600">{assignment.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(assignment.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(assignment.status)}
                                <span>{getStatusName(assignment.status)}</span>
                              </div>
                            </Badge>
                            {isOverdue(assignment) && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          {assignment.due_date ? (
                            <div>
                              <span className={`text-sm ${isOverdue(assignment) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                              <p className={`text-xs ${isOverdue(assignment) ? 'text-red-500' : 'text-gray-500'}`}>
                                {getRelativeTime(assignment.due_date)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No due date</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/assignments/${assignment.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/assignments/${assignment.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Assignment
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {assignment.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleAssignmentAction(assignment.id, 'complete')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              {assignment.status === 'completed' && (
                                <DropdownMenuItem onClick={() => handleAssignmentAction(assignment.id, 'reset')}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reset to Pending
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleAssignmentAction(assignment.id, 'delete')}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Assignment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}