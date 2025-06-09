'use client'

import Link from 'next/link'
import { ArrowLeft, Download, Users, BarChart3, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { QuestionAnalytics } from '@/lib/utils'

// Mock analytics data - this would come from your backend
const analyticsData = {
  overview: {
    totalResponses: 47,
    responseRate: 31.3,
    avgCompletionTime: 8.2,
    lastUpdated: '2 hours ago'
  },
  departments: [
    { name: 'Engineering', responses: 12, total: 20, rate: 60 },
    { name: 'Marketing', responses: 8, total: 15, rate: 53.3 },
    { name: 'Sales', responses: 10, total: 18, rate: 55.6 },
    { name: 'HR', responses: 5, total: 8, rate: 62.5 },
    { name: 'Finance', responses: 7, total: 12, rate: 58.3 },
    { name: 'Operations', responses: 5, total: 10, rate: 50 }
  ],
  questionAnalytics: [
    {
      id: 'q1',
      question: 'How would you rate your overall job satisfaction?',
      type: 'rating',
      responses: 47,
      avgRating: 3.8,
      distribution: [2, 5, 12, 18, 10] // Poor, Fair, Good, Very Good, Excellent
    },
    {
      id: 'q2', 
      question: 'Do you feel valued and appreciated at work?',
      type: 'yes_no',
      responses: 47,
      yesCount: 32,
      noCount: 15
    },
    {
      id: 'q4',
      question: 'How effectively does your supervisor communicate with you?',
      type: 'rating',
      responses: 45,
      avgRating: 4.1,
      distribution: [1, 3, 8, 21, 12]
    }
  ] as QuestionAnalytics[],
  trends: {
    responsesOverTime: [
      { date: '2024-01-15', count: 5 },
      { date: '2024-01-16', count: 12 },
      { date: '2024-01-17', count: 18 },
      { date: '2024-01-18', count: 8 },
      { date: '2024-01-19', count: 4 }
    ]
  }
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function AnalyticsPage() {
  return (
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
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{analyticsData.overview.totalResponses}</div>
              <p className="text-sm text-muted-foreground">
                <TrendingUp className="inline h-4 w-4 mr-1 text-green-600" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{analyticsData.overview.responseRate}%</div>
              <Progress value={analyticsData.overview.responseRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{analyticsData.overview.avgCompletionTime}m</div>
              <p className="text-sm text-muted-foreground">completion time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{analyticsData.overview.lastUpdated}</div>
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
              {analyticsData.departments.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">
                      {dept.responses}/{dept.total} ({dept.rate}%)
                    </span>
                  </div>
                  <Progress value={dept.rate} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Question Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Question Response Overview</CardTitle>
              <CardDescription>Response rates and completion for individual questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analyticsData.questionAnalytics.slice(0, 3).map((q) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                    <span className="text-xs text-muted-foreground ml-2">{q.responses} responses</span>
                  </div>
                  
                  {q.type === 'rating' && q.avgRating && q.distribution && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary fill-current" />
                        <span className="text-sm font-medium">Avg: {q.avgRating}/5</span>
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
            <div className="space-y-8">
              {analyticsData.questionAnalytics.map((question) => (
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
                          <span className="text-xl font-bold">{question.avgRating}</span>
                          <span className="text-muted-foreground">/ 5</span>
                        </div>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {RATING_LABELS[Math.round(question.avgRating) - 1]}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4">
                        {question.distribution.map((count, index) => {
                          const percentage = Math.round((count / question.responses) * 100)
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
                            style={{ width: `${Math.round((question.yesCount / question.responses) * 100)}%` }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {Math.round((question.yesCount / question.responses) * 100)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">{question.noCount}</div>
                        <div className="text-sm text-muted-foreground mb-2">No</div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all"
                            style={{ width: `${Math.round((question.noCount / question.responses) * 100)}%` }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {Math.round((question.noCount / question.responses) * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}