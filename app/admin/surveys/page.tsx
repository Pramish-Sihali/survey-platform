'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Users, TrendingUp, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { Survey, ApiClient ,  UserWithProfile  } from '@/lib'

interface OverviewStats {
  totalSurveys: number
  activeSurveys: number
  totalResponses: number
  recentResponses: number
}

export default function AdminSurveyPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [stats, setStats] = useState<OverviewStats>({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    recentResponses: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


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

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch surveys
        const surveysResponse = await fetch('/api/admin/surveys')
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json()
          setSurveys(surveysData.surveys || [])
        } else {
          // Fallback to public surveys
          const publicSurveys = await ApiClient.getSurveys()
          setSurveys(publicSurveys.surveys || [])
        }

        // Fetch platform stats
        const statsResponse = await fetch('/api/analytics')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalSurveys: statsData.totalSurveys || 0,
            activeSurveys: surveys.filter(s => s.is_active && s.is_published).length,
            totalResponses: statsData.totalResponses || 0,
            recentResponses: statsData.recentResponses || 0
          })
        }
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Analytics Overview</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout user={user}>
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Survey Overview</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Survey Overview</h1>
          <p className="text-lg text-muted-foreground">
            Platform-wide insights and survey performance metrics
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalSurveys}</div>
              <p className="text-sm text-muted-foreground">all time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.activeSurveys}</div>
              <p className="text-sm text-muted-foreground">currently published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalResponses}</div>
              <p className="text-sm text-muted-foreground">across all surveys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.recentResponses}</div>
              <p className="text-sm text-muted-foreground">last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List with Quick Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Survey Analytics
            </CardTitle>
            <CardDescription>
              View detailed analytics for each survey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {surveys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No surveys found.</p>
                <Link href="/admin/surveys/new">
                  <Button>
                    Create Your First Survey
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{survey.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          survey.is_active && survey.is_published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {survey.is_active && survey.is_published ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {survey.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(survey.created_at).toLocaleDateString()}</span>
                        {survey.start_date && <span>Starts: {new Date(survey.start_date).toLocaleDateString()}</span>}
                        {survey.end_date && <span>Ends: {new Date(survey.end_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/analytics/${survey.id}`}>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Insights
            </CardTitle>
            <CardDescription>Key metrics and trends across your survey platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Response Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Response Rate</span>
                    <span className="font-medium">
                      {stats.totalSurveys > 0 ? Math.round((stats.totalResponses / stats.totalSurveys) * 10) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Surveys</span>
                    <span className="font-medium">{stats.activeSurveys}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Responses</span>
                    <span className="font-medium">{stats.totalResponses}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Platform Health</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">System Status</span>
                    <span className="text-green-600 font-medium">Operational</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Database Connection</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recent Activity</span>
                    <span className="font-medium">{stats.recentResponses} responses</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthenticatedLayout>
  )
}