// Updated app/admin/analytics/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Users, BarChart3, TrendingUp, Star, AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { Survey, ApiClient ,  UserWithProfile,  AnalyticsResponse  } from '@/lib/utils'
import { CombinedAuditInterface } from '@/components/admin/CombinedAuditInterface'
import { AuditAnalyticsComparison } from '@/components/admin/AuditAnalyticsComparison'

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function IndividualSurveyAnalyticsPage() {
  const params = useParams()
  const surveyId = params.id as string
  
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'analytics' | 'audit' | 'audit-analytics'>('analytics')

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
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        
        // Fetch survey details
        const surveyResponse = await ApiClient.getSurvey(surveyId)
        setSurvey(surveyResponse.survey)
        
        // Fetch analytics data
        const analyticsResponse = await ApiClient.getAnalytics(surveyId)
        setAnalytics(analyticsResponse)
      } catch (err) {
        setError('Failed to load analytics data')
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (surveyId) {
      fetchAnalytics()
    }
  }, [surveyId])

  const handleExport = () => {
    if (!analytics) return
    
    const data = {
      survey: survey?.title,
      overview: analytics.overview,
      departments: analytics.departments,
      questions: analytics.questionAnalytics,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey-analytics-${surveyId}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                <span className="text-xl font-bold text-foreground">Survey Analytics</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
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

  if (error || !analytics) {
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
              <CardDescription>{error || 'Failed to load analytics data'}</CardDescription>
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

  const filteredDepartments = departmentFilter === 'all' 
    ? analytics.departments 
    : analytics.departments.filter(dept => dept.name === departmentFilter)

  return (
    <AuthenticatedLayout user={user}>
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Survey Analytics</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {analytics.departments.map(dept => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Survey Title */}
        {survey && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-lg text-muted-foreground">{survey.description}</p>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Survey Analytics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Audit Questions & Responses
          </button>
          <button
            onClick={() => setActiveTab('audit-analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'audit-analytics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2 inline" />
            Audit Analytics Comparison
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && (
          <>
            {/* Overview Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{analytics.overview.totalResponses}</div>
                  <p className="text-sm text-muted-foreground">
                    <TrendingUp className="inline h-4 w-4 mr-1 text-green-600" />
                    Survey submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">{analytics.overview.responseRate.toFixed(1)}%</div>
                  <Progress value={analytics.overview.responseRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{analytics.overview.avgCompletionTime}m</div>
                  <p className="text-sm text-muted-foreground">completion time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">
                    {new Date(analytics.overview.lastUpdated).toLocaleTimeString()}
                  </div>
                  <p className="text-sm text-muted-foreground">real-time data</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Department Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Response by Department
                  </CardTitle>
                  <CardDescription>Participation rates across different departments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-muted-foreground">
                            {dept.responses}/{dept.total} ({dept.rate.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={dept.rate} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No department data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Question Response Overview</CardTitle>
                  <CardDescription>Response rates and completion for individual questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analytics.questionAnalytics.slice(0, 3).map((q) => (
                    <div key={q.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                        <span className="text-xs text-muted-foreground ml-2">{q.responses} responses</span>
                      </div>
                      
                      {q.type === 'rating' && q.avgRating && q.distribution && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary fill-current" />
                            <span className="text-sm font-medium">Avg: {q.avgRating.toFixed(1)}/5</span>
                            <span className="text-xs text-muted-foreground">
                              ({RATING_LABELS[Math.round(q.avgRating) - 1]})
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {q.distribution.map((count, index) => {
                              const maxCount = Math.max(...(q.distribution || [1]))
                              return (
                                <div key={index} className="flex-1">
                                  <div className="text-xs text-center mb-1">{count}</div>
                                  <div 
                                    className="bg-primary/20 rounded-sm" 
                                    style={{ height: `${(count / maxCount) * 40}px` }}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {q.type === 'yes_no' && q.yesCount !== undefined && q.noCount !== undefined && (
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-sm">Yes: {q.yesCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-sm">No: {q.noCount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {analytics.questionAnalytics.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No question data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Question Analysis</CardTitle>
                <CardDescription>In-depth breakdown of each survey question</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.questionAnalytics.length > 0 ? (
                  <div className="space-y-8">
                    {analytics.questionAnalytics.map((question) => (
                      <div key={question.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-lg">{question.question}</h4>
                          <div className="text-sm text-muted-foreground">
                            {question.responses} responses
                          </div>
                        </div>

                        {question.type === 'rating' && question.avgRating && question.distribution && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-primary fill-current" />
                                <span className="text-xl font-bold">{question.avgRating.toFixed(1)}</span>
                                <span className="text-muted-foreground">/ 5</span>
                              </div>
                              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                {RATING_LABELS[Math.round(question.avgRating) - 1]}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-4">
                              {question.distribution.map((count, index) => {
                                const percentage = question.responses > 0 ? Math.round((count / question.responses) * 100) : 0
                                return (
                                  <div key={index} className="text-center">
                                    <div className="text-2xl font-bold text-primary mb-1">{count}</div>
                                    <div className="text-xs text-muted-foreground mb-2">{RATING_LABELS[index]}</div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {percentage}%
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {question.type === 'yes_no' && question.yesCount !== undefined && question.noCount !== undefined && (
                          <div className="grid grid-cols-2 gap-8">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600 mb-2">{question.yesCount}</div>
                              <div className="text-sm text-muted-foreground mb-2">Yes</div>
                              <div className="w-full bg-muted rounded-full h-3">
                                <div 
                                  className="bg-green-500 h-3 rounded-full transition-all"
                                  style={{ width: `${question.responses > 0 ? Math.round((question.yesCount / question.responses) * 100) : 0}%` }}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {question.responses > 0 ? Math.round((question.yesCount / question.responses) * 100) : 0}%
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-3xl font-bold text-red-600 mb-2">{question.noCount}</div>
                              <div className="text-sm text-muted-foreground mb-2">No</div>
                              <div className="w-full bg-muted rounded-full h-3">
                                <div 
                                  className="bg-red-500 h-3 rounded-full transition-all"
                                  style={{ width: `${question.responses > 0 ? Math.round((question.noCount / question.responses) * 100) : 0}%` }}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {question.responses > 0 ? Math.round((question.noCount / question.responses) * 100) : 0}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
                    <p>Analytics will appear here once responses are submitted to this survey.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'audit' && (
          <CombinedAuditInterface surveyId={surveyId} />
        )}

        {activeTab === 'audit-analytics' && (
          <AuditAnalyticsComparison surveyId={surveyId} />
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  )
}