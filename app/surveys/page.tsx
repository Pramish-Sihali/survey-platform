'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiClient, Survey, formatDate,  } from '@/lib/utils'

export default function SurveySelectionPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true)
        const response = await ApiClient.getSurveys()
        setSurveys(response.surveys || [])
      } catch (err) {
        setError('Failed to load surveys. Please try again later.')
        console.error('Error fetching surveys:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  const getTimeRemaining = (endDate: string | null): string => {
    if (!endDate) return 'No deadline'
    
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Ends today'
    if (diffDays === 1) return '1 day remaining'
    return `${diffDays} days remaining`
  }

  const getSurveyStatus = (survey: Survey): 'active' | 'ending-soon' | 'expired' => {
    if (!survey.end_date) return 'active'
    
    const now = new Date()
    const end = new Date(survey.end_date)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'expired'
    if (diffDays <= 3) return 'ending-soon'
    return 'active'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span>corp Surveys
                </span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading available surveys...</p>
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
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Back to Home</span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Surveys</CardTitle>
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
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Home</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span>corp Surveys
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Available Surveys</h1>
          <p className="text-lg text-muted-foreground">
            Choose a survey to participate in and share your valuable feedback
          </p>
        </div>

        {surveys.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Active Surveys</CardTitle>
              <CardDescription>
                There are currently no active surveys available. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            {surveys.map((survey) => {
              const status = getSurveyStatus(survey)
              const timeRemaining = getTimeRemaining(survey.end_date)
              const isExpired = status === 'expired'
              
              return (
                <Card 
                  key={survey.id} 
                  className={`transition-all hover:shadow-lg ${
                    isExpired ? 'opacity-60' : 'cursor-pointer hover:border-primary/50'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{survey.title}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            status === 'active' ? 'bg-green-100 text-green-700' :
                            status === 'ending-soon' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {status === 'active' ? 'Active' :
                             status === 'ending-soon' ? 'Ending Soon' :
                             'Expired'}
                          </span>
                        </div>
                        <CardDescription className="text-base">
                          {survey.description || 'Help us improve by sharing your thoughts and experiences.'}
                        </CardDescription>
                      </div>
                      {!isExpired && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {survey.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Started {formatDate(survey.start_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{timeRemaining}</span>
                        </div>
                      </div>
                      
                      {isExpired ? (
                        <Button disabled variant="outline">
                          Survey Closed
                        </Button>
                      ) : (
                        <Link href={`/form/${survey.id}`}>
                          <Button>
                            Take Survey
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Information Box */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Important Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your responses are confidential and will be used for analytical purposes only</li>
                  <li>• You can only submit one response per survey</li>
                  <li>• Please complete the survey by the specified deadline</li>
                  <li>• Contact HR if you have any questions about the surveys</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}