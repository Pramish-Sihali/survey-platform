'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, BarChart3, ClipboardList, Users, ArrowLeft, ToggleLeft, ToggleRight, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiClient, Survey, formatDate, formatDateTime } from '@/lib/utils'

interface AdminStats {
  totalSurveys: number
  activeSurveys: number
  totalResponses: number
  recentResponses: number
}

export default function AdminPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    recentResponses: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        
        // Fetch all surveys (would need admin endpoint)
        const surveysResponse = await fetch('/api/admin/surveys')
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json()
          setSurveys(surveysData.surveys || [])
          
          // Calculate stats
          const totalSurveys = surveysData.surveys?.length || 0
          const activeSurveys = surveysData.surveys?.filter((s: Survey) => s.is_active && s.is_published).length || 0
          
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

  const toggleSurveyStatus = async (surveyId: string, newStatus: boolean) => {
    try {
      const survey = surveys.find(s => s.id === surveyId)
      if (!survey) return

      await ApiClient.updateSurvey(surveyId, { ...survey, is_published: newStatus })
      
      // Update local state
      setSurveys(prevSurveys => 
        prevSurveys.map(s => 
          s.id === surveyId ? { ...s, is_published: newStatus } : s
        )
      )
    } catch (err) {
      console.error('Error updating survey status:', err)
      alert('Failed to update survey status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span> Admin
                </span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span> Admin
                </span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Back to Site</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span> Admin
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/surveys/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Survey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your surveys and view response analytics
          </p>
        </div>

        {/* Quick Stats */}
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
              <p className="text-sm text-muted-foreground">all surveys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.recentResponses}</div>
              <p className="text-sm text-muted-foreground">last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
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
              <ClipboardList className="h-10 w-10 text-secondary mb-2" />
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
              <Settings className="h-10 w-10 text-primary mb-2" />
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

        {/* Surveys Overview */}
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
              <div className="text-center py-8 text-muted-foreground">
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
                      <h4 className="font-medium text-lg">{survey.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {survey.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {formatDate(survey.created_at)}</span>
                        {survey.start_date && <span>Starts: {formatDate(survey.start_date)}</span>}
                        {survey.end_date && <span>Ends: {formatDate(survey.end_date)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Published:</span>
                        <button
                          onClick={() => toggleSurveyStatus(survey.id, !survey.is_published)}
                          className="flex items-center space-x-1"
                        >
                          {survey.is_published ? (
                            <>
                              <ToggleRight className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-5 w-5 text-red-600" />
                              <span className="text-sm font-medium text-red-600">Inactive</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/analytics/${survey.id}`}>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/admin/surveys/${survey.id}/edit`}>
                          {/* <Button size="sm" variant="ghost">
                            Edit
                          </Button> */}
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
    </div>
  )
}