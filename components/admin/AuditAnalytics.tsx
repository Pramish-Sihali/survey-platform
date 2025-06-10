// components/admin/AuditAnalytics.tsx
'use client'

import { Star, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface AuditQuestion {
  id: string
  question_text: string
  question_type: string
  category: string
  description: string
  survey_audit_question_options?: Array<{ option_text: string }>
}

interface AuditResponse {
  survey_audit_question_id: string
  response_type: string
  text_response?: string
  number_response?: number
  array_response?: string[]
  object_response?: any
  responded_by: string
  responded_at: string
}

interface AuditAnalyticsProps {
  auditQuestions: AuditQuestion[]
  auditResponses: AuditResponse[]
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function AuditAnalytics({ auditQuestions, auditResponses }: AuditAnalyticsProps) {
  if (auditQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Analysis</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No audit questions have been created for this survey.</p>
        </CardContent>
      </Card>
    )
  }

  // Create a map of responses by question ID
  const responseMap = auditResponses.reduce((acc, response) => {
    acc[response.survey_audit_question_id] = response
    return acc
  }, {} as Record<string, AuditResponse>)

  // Group questions by category
  const questionsByCategory = auditQuestions.reduce((acc, question) => {
    const category = question.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(question)
    return acc
  }, {} as Record<string, AuditQuestion[]>)

  const renderResponseDisplay = (question: AuditQuestion, response?: AuditResponse) => {
    if (!response) {
      return <span className="text-muted-foreground italic">No response provided</span>
    }

    switch (question.question_type) {
      case 'text':
        return (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">{response.text_response || 'No response'}</p>
          </div>
        )

      case 'yes_no':
        const isYes = response.text_response === 'yes'
        return (
          <div className="flex items-center gap-2">
            {isYes ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${isYes ? 'text-green-700' : 'text-red-700'}`}>
              {isYes ? 'Yes' : 'No'}
            </span>
          </div>
        )

      case 'radio':
      case 'select':
        return (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
            <span className="font-medium text-primary">{response.text_response}</span>
          </div>
        )

      case 'checkbox':
        const checkboxResponses = response.array_response || []
        return (
          <div className="space-y-1">
            {checkboxResponses.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
            {checkboxResponses.length === 0 && (
              <span className="text-muted-foreground italic">No selections made</span>
            )}
          </div>
        )

      case 'rating':
        const rating = response.number_response || 0
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= rating 
                        ? 'text-primary fill-current' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{rating}/5</span>
              {rating > 0 && (
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {RATING_LABELS[rating - 1]}
                </span>
              )}
            </div>
          </div>
        )

      default:
        return <span className="text-muted-foreground">Unknown response type</span>
    }
  }

  const completionRate = auditQuestions.length > 0 
    ? Math.round((auditResponses.length / auditQuestions.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Audit Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{auditQuestions.length}</div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{auditResponses.length}</div>
              <p className="text-sm text-muted-foreground">Answered</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completionRate}%</div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Audit Progress</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Audit Responses by Category */}
      {Object.entries(questionsByCategory).map(([category, questions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question) => {
              const response = responseMap[question.id]
              return (
                <div key={question.id} className="border-l-4 border-primary/30 pl-4">
                  <div className="mb-2">
                    <h4 className="font-medium">{question.question_text}</h4>
                    {question.description && (
                      <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                    )}
                  </div>
                  {renderResponseDisplay(question, response)}
                  {response && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Answered by {response.responded_by} on {new Date(response.responded_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
