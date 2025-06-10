// components/admin/AuditResponseForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Star, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AuditQuestion {
  id: string
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
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
}

interface AuditResponseFormProps {
  surveyId: string
  auditQuestions: AuditQuestion[]
  existingResponses: AuditResponse[]
  onSave: () => void
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function AuditResponseForm({ surveyId, auditQuestions, existingResponses, onSave }: AuditResponseFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Initialize responses from existing data
    const initialResponses: Record<string, any> = {}
    existingResponses.forEach(response => {
      const questionId = response.survey_audit_question_id
      switch (response.response_type) {
        case 'text':
          initialResponses[questionId] = response.text_response || ''
          break
        case 'number':
          initialResponses[questionId] = response.number_response || 0
          break
        case 'array':
          initialResponses[questionId] = response.array_response || []
          break
        case 'object':
          initialResponses[questionId] = response.object_response || {}
          break
      }
    })
    setResponses(initialResponses)
  }, [existingResponses])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      const response = await fetch(`/api/admin/surveys/${surveyId}/audit-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          responded_by: 'admin'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save audit responses')
      }

      onSave()
    } catch (error) {
      console.error('Error saving audit responses:', error)
      alert('Failed to save audit responses')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: AuditQuestion) => {
    const response = responses[question.id]

    switch (question.question_type) {
      case 'text':
        return (
          <Input
            placeholder="Enter your response..."
            value={response || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={submitting}
          />
        )

      case 'yes_no':
        return (
          <RadioGroup
            value={response || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            disabled={submitting}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>No</Label>
            </div>
          </RadioGroup>
        )

      case 'radio':
        return (
          <RadioGroup
            value={response || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            disabled={submitting}
          >
            {question.survey_audit_question_options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.option_text} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option.option_text}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        const checkboxResponse = Array.isArray(response) ? response : []
        return (
          <div className="space-y-3">
            {question.survey_audit_question_options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${question.id}-${index}`}
                  checked={checkboxResponse.includes(option.option_text)}
                  onChange={(e) => {
                    let newResponse: string[]
                    if (e.target.checked) {
                      newResponse = [...checkboxResponse, option.option_text]
                    } else {
                      newResponse = checkboxResponse.filter(item => item !== option.option_text)
                    }
                    handleResponseChange(question.id, newResponse)
                  }}
                  disabled={submitting}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <Label htmlFor={`${question.id}-${index}`}>{option.option_text}</Label>
              </div>
            ))}
          </div>
        )

      case 'rating':
        const ratingValue = response || 0
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleResponseChange(question.id, rating)}
                  disabled={submitting}
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all hover:scale-105",
                    ratingValue === rating
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                >
                  <Star 
                    className={cn(
                      "h-6 w-6",
                      ratingValue === rating ? "fill-current" : ""
                    )} 
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {ratingValue > 0 && RATING_LABELS[ratingValue - 1]}
              </span>
            </div>
          </div>
        )

      case 'select':
        return (
          <Select
            value={response || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.survey_audit_question_options?.map((option, index) => (
                <SelectItem key={index} value={option.option_text}>
                  {option.option_text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  if (auditQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No audit questions have been created for this survey yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Group questions by category
  const questionsByCategory = auditQuestions.reduce((acc, question) => {
    const category = question.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(question)
    return acc
  }, {} as Record<string, AuditQuestion[]>)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(questionsByCategory).map(([category, questions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-base font-medium">
                  {question.question_text}
                  {question.is_required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
                {renderQuestion(question)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Audit Responses
            </>
          )}
        </Button>
      </div>
    </form>
  )
}