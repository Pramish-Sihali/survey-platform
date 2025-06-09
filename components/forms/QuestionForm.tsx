import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormStep, Question } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface QuestionFormProps {
  step: FormStep
  responses: Record<string, any>
  onResponseChange: (questionId: string, response: any) => void
  onNext: () => void
  onPrev: () => void
  onSubmit?: () => void
  isLastStep: boolean
  canProceed: boolean
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function QuestionForm({
  step,
  responses,
  onResponseChange,
  onNext,
  onPrev,
  onSubmit,
  isLastStep,
  canProceed
}: QuestionFormProps) {
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({})

  const handleOtherChange = (questionId: string, value: string) => {
    setOtherInputs(prev => ({ ...prev, [questionId]: value }))
    if (value.trim()) {
      onResponseChange(questionId, { main: responses[questionId]?.main, other: value })
    }
  }

  const renderQuestion = (question: Question) => {
    const response = responses[question.id]

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Enter your response..."
              value={response || ''}
              onChange={(e) => onResponseChange(question.id, e.target.value)}
              className="w-full"
            />
          </div>
        )

      case 'yes_no':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={response?.main || response || ''}
              onValueChange={(value) => {
                if (question.hasOther) {
                  onResponseChange(question.id, { main: value, other: otherInputs[question.id] || '' })
                } else {
                  onResponseChange(question.id, value)
                }
              }}
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
            
            {question.hasOther && (
              <div className="mt-4">
                <Label htmlFor={`${question.id}-other`} className="text-sm text-muted-foreground">
                  Additional comments (optional):
                </Label>
                <Input
                  id={`${question.id}-other`}
                  placeholder="Please explain..."
                  value={otherInputs[question.id] || ''}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={response?.main || response || ''}
              onValueChange={(value) => {
                if (question.hasOther) {
                  onResponseChange(question.id, { main: value, other: otherInputs[question.id] || '' })
                } else {
                  onResponseChange(question.id, value)
                }
              }}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {question.hasOther && (
              <div className="mt-4">
                <Label htmlFor={`${question.id}-other`} className="text-sm text-muted-foreground">
                  Other (please specify):
                </Label>
                <Input
                  id={`${question.id}-other`}
                  placeholder="Please specify..."
                  value={otherInputs[question.id] || ''}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )

      case 'checkbox':
        const checkboxResponse = Array.isArray(response) ? response : []
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${question.id}-${index}`}
                    checked={checkboxResponse.includes(option)}
                    onChange={(e) => {
                      let newResponse
                      if (e.target.checked) {
                        newResponse = [...checkboxResponse, option]
                      } else {
                        newResponse = checkboxResponse.filter((item: string) => item !== option)
                      }
                      onResponseChange(question.id, newResponse)
                    }}
                    className="rounded border-primary text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            
            {question.hasOther && (
              <div className="mt-4">
                <Label htmlFor={`${question.id}-other`} className="text-sm text-muted-foreground">
                  Other (please specify):
                </Label>
                <Input
                  id={`${question.id}-other`}
                  placeholder="Please specify..."
                  value={otherInputs[question.id] || ''}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => onResponseChange(question.id, rating)}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all hover:scale-105",
                      response === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}
                  >
                    <Star 
                      className={cn(
                        "h-6 w-6",
                        response === rating ? "fill-current" : ""
                      )} 
                    />
                  </button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {response && RATING_LABELS[response - 1] && (
                  <span className="font-medium text-foreground">
                    {RATING_LABELS[response - 1]}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Poor</span>
              <span>3 - Neutral</span>
              <span>5 - Excellent</span>
            </div>
            
            {question.hasOther && (
              <div className="mt-4">
                <Label htmlFor={`${question.id}-other`} className="text-sm text-muted-foreground">
                  Additional comments (optional):
                </Label>
                <Input
                  id={`${question.id}-other`}
                  placeholder="Please explain your rating..."
                  value={otherInputs[question.id] || ''}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )

      case 'select':
        return (
          <div className="space-y-4">
            <Select
              value={response?.main || response || ''}
              onValueChange={(value) => {
                if (question.hasOther) {
                  onResponseChange(question.id, { main: value, other: otherInputs[question.id] || '' })
                } else {
                  onResponseChange(question.id, value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {question.hasOther && (
              <div className="mt-4">
                <Label htmlFor={`${question.id}-other`} className="text-sm text-muted-foreground">
                  Other (please specify):
                </Label>
                <Input
                  id={`${question.id}-other`}
                  placeholder="Please specify..."
                  value={otherInputs[question.id] || ''}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{step.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {step.questions.map((question, index) => (
          <div key={question.id} className="space-y-4 p-6 border rounded-lg">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1 space-y-4">
                <Label className="text-base font-medium leading-relaxed">
                  {question.question}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderQuestion(question)}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {isLastStep ? (
            <Button onClick={onSubmit} disabled={!canProceed} size="lg">
              Submit Survey
              <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={onNext} disabled={!canProceed}>
              Next Section
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}