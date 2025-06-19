// app/admin/users/[id]/page.tsx - User Profile View
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  User, 
  MapPin, 
  Clock,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Activity,
  BarChart3,
  FileText,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { ApiClient, UserWithProfile, SafeUserWithProfile, UserRole } from '@/lib'

interface UserActivity {
  id: string
  type: 'login' | 'survey_completed' | 'profile_updated' | 'assignment_received'
  description: string
  timestamp: string
  metadata?: any
}

interface UserStats {
  totalAssignments: number
  completedSurveys: number
  pendingAssignments: number
  averageCompletionTime: number
  lastActivity: string
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  
  const [currentUser, setCurrentUser] = useState<UserWithProfile | null>(null)
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true)
  const [profileUser, setProfileUser] = useState<SafeUserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    totalAssignments: 0,
    completedSurveys: 0,
    pendingAssignments: 0,
    averageCompletionTime: 0,
    lastActivity: ''
  })
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])

  // Get current authenticated user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error getting current user:', error)
      } finally {
        setIsLoadingCurrentUser(false)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser || !userId) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiClient.getUser(userId)
        setProfileUser(response.user)
        
        // Fetch user assignments and stats
        await fetchUserStats()
        await fetchUserActivity()
        
      } catch (err: any) {
        console.error('Error fetching user profile:', err)
        setError(err.message || 'Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchUserProfile()
    }
  }, [currentUser, userId])

  const fetchUserStats = async () => {
    try {
      // Fetch assignments for this user
      const assignmentsResponse = await ApiClient.getAssignments({
        user_id: userId,
        // company_id: currentUser?.company_id
      })
      
      const assignments = assignmentsResponse.assignments
      const totalAssignments = assignments.length
      const completedSurveys = assignments.filter(a => a.status === 'completed').length
      const pendingAssignments = assignments.filter(a => a.status === 'pending').length
      
      setUserStats({
        totalAssignments,
        completedSurveys,
        pendingAssignments,
        averageCompletionTime: 8.5, // This would be calculated from actual data
        lastActivity: profileUser?.last_login || ''
      })
    } catch (err) {
      console.error('Error fetching user stats:', err)
    }
  }

  const fetchUserActivity = async () => {
    // This would fetch actual activity data from an activity log table
    // For now, we'll use mock data
    const mockActivity: UserActivity[] = [
      {
        id: '1',
        type: 'login',
        description: 'Logged into the system',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'survey_completed',
        description: 'Completed Employee Satisfaction Survey',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'assignment_received',
        description: 'Received new survey assignment',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    setUserActivity(mockActivity)
  }

  const handleUserAction = async (action: string) => {
    if (!profileUser) return
    
    try {
      switch (action) {
        case 'activate':
          await ApiClient.updateUser(profileUser.id, { is_active: true })
          setProfileUser(prev => prev ? { ...prev, is_active: true } : null)
          break
        case 'deactivate':
          await ApiClient.updateUser(profileUser.id, { is_active: false })
          setProfileUser(prev => prev ? { ...prev, is_active: false } : null)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await ApiClient.deleteUser(profileUser.id)
            // Redirect back to users list
            window.location.href = '/admin/users'
          }
          break
        case 'resend-invite':
          // Implement resend invite
          alert('Invitation email sent successfully!')
          break
      }
    } catch (err) {
      console.error('User action error:', err)
      alert('Failed to perform action')
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'company_admin': return 'bg-yellow-100 text-yellow-800'
      case 'company_user': return 'bg-green-100 text-green-800'
      case 'super_admin': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'company_admin': return 'Company Admin'
      case 'company_user': return 'User'
      case 'super_admin': return 'Super Admin'
      default: return role
    }
  }

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'login': return <User className="h-4 w-4" />
      case 'survey_completed': return <FileText className="h-4 w-4" />
      case 'profile_updated': return <Edit className="h-4 w-4" />
      case 'assignment_received': return <Mail className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  if (isLoadingCurrentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <div>Error loading user</div>
  }

  if (loading) {
    return (
      <AuthenticatedLayout user={currentUser}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error || !profileUser) {
    return (
      <AuthenticatedLayout user={currentUser}>
        <div className="max-w-4xl mx-auto">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Error Loading User</CardTitle>
              <CardDescription>{error || 'User not found'}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/users">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout user={currentUser}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
              <p className="text-gray-600 mt-1">{profileUser.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/admin/users/${profileUser.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profileUser.is_active ? (
                  <DropdownMenuItem onClick={() => handleUserAction('deactivate')}>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleUserAction('activate')}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate User
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleUserAction('resend-invite')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Invite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleUserAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* User Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleColor(profileUser.role)}>
                    {getRoleName(profileUser.role)}
                  </Badge>
                  <Badge variant={profileUser.is_active ? "default" : "secondary"}>
                    {profileUser.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {profileUser.designation && (
                    <span className="text-sm text-gray-600">{profileUser.designation}</span>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {profileUser.department_name && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{profileUser.department_name}</span>
                    </div>
                  )}
                  
                  {profileUser.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{profileUser.phone}</span>
                    </div>
                  )}
                  
                  {profileUser.hire_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Hired {new Date(profileUser.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {profileUser.last_login && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Last login {getRelativeTime(profileUser.last_login)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Assignments</p>
                      <p className="text-2xl font-bold">{userStats.totalAssignments}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{userStats.completedSurveys}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{userStats.pendingAssignments}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Time</p>
                      <p className="text-2xl font-bold">{userStats.averageCompletionTime}m</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{profileUser.bio}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent actions and events for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Survey Assignments</CardTitle>
                <CardDescription>
                  Surveys assigned to this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No assignments found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Assignments will appear here when surveys are assigned to this user
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Details Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-gray-900">{profileUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{profileUser.email}</p>
                  </div>
                  {profileUser.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-gray-900">{profileUser.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileUser.designation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Position</Label>
                      <p className="text-gray-900">{profileUser.designation}</p>
                    </div>
                  )}
                 
                  {profileUser.supervisor_name && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Supervisor</Label>
                      <p className="text-gray-900">{profileUser.supervisor_name}</p>
                    </div>
                  )}
                  {profileUser.reports_to && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Reports To</Label>
                      <p className="text-gray-900">{profileUser.reports_to}</p>
                    </div>
                  )}
                  {profileUser.hire_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Hire Date</Label>
                      <p className="text-gray-900">{new Date(profileUser.hire_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Role</Label>
                    <p className="text-gray-900">{getRoleName(profileUser.role)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <p className="text-gray-900">{profileUser.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                    <p className="text-gray-900">{new Date(profileUser.created_at).toLocaleDateString()}</p>
                  </div>
                  {profileUser.last_login && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                      <p className="text-gray-900">{new Date(profileUser.last_login).toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}

// Helper component for consistent labeling
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}