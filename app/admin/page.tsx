// app/admin/page.tsx - REFACTORED TO USE AuthenticatedLayout
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, BarChart3, ClipboardList, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { Survey, UserWithProfile, ApiClient, formatDate } from '@/lib'

interface AdminStats {
  totalSurveys: number
  activeSurveys: number
  totalResponses: number
  recentResponses: number
}

export default function AdminPage() {
  // ✅ Keep only the page-specific state
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    recentResponses: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // ✅ User state for the layout
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // ✅ Get user for the layout
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

  // ✅ Keep your existing data fetching logic
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        
        // Fetch all surveys (admin endpoint)
        const surveysResponse = await fetch('/api/admin/surveys')
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json()
          setSurveys(surveysData.surveys || [])
          
          // Calculate stats
          const totalSurveys = surveysData.surveys?.length || 0
          const activeSurveys = surveysData.surveys?.filter((s: Survey) => s.is_active).length || 0
          
          setStats({
            totalSurveys,
            activeSurveys,
            totalResponses: 0, // Would be calculated from responses
            recentResponses: 0
          })
        } else {
          // Fallback to public surveys endpoint
          const publicSurveys = await ApiClient.getSurveys()
          setSurveys(publicSurveys.surveys || [])
          setStats({
            totalSurveys: publicSurveys.surveys?.length || 0,
            activeSurveys: publicSurveys.surveys?.length || 0,
            totalResponses: 0,
            recentResponses: 0
          })
        }
      } catch (err) {
        setError('Failed to load admin data')
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  // ✅ Keep your existing toggle logic
  const toggleSurveyStatus = async (surveyId: string, currentStatus: boolean) => {
    try {
      setUpdating(surveyId)
      
      const survey = surveys.find(s => s.id === surveyId)
      if (!survey) return

      // Only toggle is_active (simplified)
      const updatedSurvey = {
        ...survey,
        is_active: !currentStatus,
        is_published: true // Keep published as true always
      }

      await ApiClient.updateSurvey(surveyId, updatedSurvey)
      
      // Update local state
      setSurveys(prevSurveys => 
        prevSurveys.map(s => 
          s.id === surveyId ? { ...s, is_active: !currentStatus } : s
        )
      )

      // Update stats
      setStats(prev => ({
        ...prev,
        activeSurveys: !currentStatus ? prev.activeSurveys + 1 : prev.activeSurveys - 1
      }))

    } catch (err) {
      console.error('Error updating survey status:', err)
      alert('Failed to update survey status')
    } finally {
      setUpdating(null)
    }
  }

  // ✅ Show loading while getting user
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

  // ✅ Handle user not found
  if (!user) {
    return <div>Error loading user</div>
  }

  // ✅ Show page loading state within the layout
  if (loading) {
    return (
      <AuthenticatedLayout user={user}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </AuthenticatedLayout>
    )
  }

  // ✅ Show error state within the layout
  if (error) {
    return (
      <AuthenticatedLayout user={user}>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
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

  // ✅ Main content wrapped in AuthenticatedLayout
  return (
    <AuthenticatedLayout user={user}>
      <div className="space-y-6">
        {/* ✅ Page Header with Action */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your surveys and view response analytics
            </p>
          </div>
          <Link href="/admin/surveys/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Survey
            </Button>
          </Link>
        </div>

        {/* ✅ Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.totalSurveys}</div>
              <p className="text-sm text-gray-600">all time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.activeSurveys}</div>
              <p className="text-sm text-gray-600">visible to users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalResponses}</div>
              <p className="text-sm text-gray-600">all surveys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.recentResponses}</div>
              <p className="text-sm text-gray-600">last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                Comprehensive insights and response analysis with charts and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ClipboardList className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Manage Questions</CardTitle>
              <CardDescription>
                Create, edit, and organize survey questions and sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/questions">
                <Button variant="outline" className="w-full">
                  Edit Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Survey Settings</CardTitle>
              <CardDescription>
                Configure survey status, departments, and general settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full">
                  Manage Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Surveys Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Survey Management
                </CardTitle>
                <CardDescription>Manage survey status and view basic information</CardDescription>
              </div>
              <Link href="/admin/surveys/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Survey
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No surveys created yet.</p>
                <Link href="/admin/surveys/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Survey
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{survey.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          survey.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {survey.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {survey.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Created: {formatDate(survey.created_at)}</span>
                        {survey.start_date && <span>Starts: {formatDate(survey.start_date)}</span>}
                        {survey.end_date && <span>Ends: {formatDate(survey.end_date)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Active:</span>
                        <Switch
                          checked={survey.is_active}
                          onCheckedChange={() => toggleSurveyStatus(survey.id, survey.is_active)}
                          disabled={updating === survey.id}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/analytics/${survey.id}`}>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/admin/surveys/${survey.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}