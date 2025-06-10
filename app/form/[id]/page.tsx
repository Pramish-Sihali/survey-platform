'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmployeeInfoForm } from '@/components/forms/EmployeeInfoForm'
import { QuestionForm } from '@/components/forms/QuestionForm'
import { FormComplete } from '@/components/forms/FormComplete'
import { 
  EmployeeInfo, 
  FormStep, 
  FormResponses, 
  FormResponseValue, 
  Survey,
  ApiClient,
  convertSurveyToFormSteps,
  convertFormResponseToApiFormat,
  isDateInRange
} from '@/lib/utils'

export default function DynamicFormPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [currentStep, setCurrentStep] = useState(0)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [formSteps, setFormSteps] = useState<FormStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: '',
    designation: '',
    department: '',
    supervisor: '',
    reportsTo: '',
  })
  const [formResponses, setFormResponses] = useState<FormResponses>({})

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Validate survey ID
        if (!surveyId || typeof surveyId !== 'string') {
          setError('Invalid survey ID')
          return
        }

        const response = await ApiClient.getSurvey(surveyId)
        setSurvey(response.survey)
        
        // Convert survey to form steps
        const steps = convertSurveyToFormSteps(response.survey)
        setFormSteps(steps)
        
        // Validate survey availability
        if (!response.survey.is_active || !response.survey.is_published) {
          setError('This survey is no longer available.')
          return
        }
        
        // Check survey dates
        if (!isDateInRange(response.survey.start_date, response.survey.end_date)) {
          if (response.survey.end_date && new Date() > new Date(response.survey.end_date)) {
            setError('This survey has closed. The deadline has passed.')
          } else if (response.survey.start_date && new Date() < new Date(response.survey.start_date)) {
            setError('This survey is not yet available.')
          } else {
            setError('This survey is not currently active.')
          }
          return
        }
        
      } catch (err: any) {
        console.error('Error fetching survey:', err)
        if (err.message?.includes('not found')) {
          setError('Survey not found. It may have been removed or you may have an incorrect link.')
        } else {
          setError('Failed to load survey. Please check your internet connection and try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (surveyId) {
      fetchSurvey()
    }
  }, [surveyId])

  const totalSteps = formSteps.length
  const progress = totalSteps === 0 ? 0 : ((currentStep + 1) / (totalSteps + 2)) * 100

  const handleEmployeeInfoSubmit = (info: EmployeeInfo) => {
    setEmployeeInfo(info)
    setCurrentStep(1)
  }

  const handleQuestionResponse = (questionId: string, response: FormResponseValue) => {
    setFormResponses(prev => ({
      ...prev,
      [questionId]: response
    }))
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFormSubmit = async () => {
    try {
      setSubmitting(true)
      
      // Calculate completion time in minutes
      const completionTimeMinutes = Math.round((Date.now() - startTime) / (1000 * 60))
      
      // Validate that we have responses for all required questions
      const allRequiredAnswered = formSteps.every(step => 
        step.questions.every(q => {
          if (!q.required) return true
          const response = formResponses[q.id]
          return response !== undefined && response !== null && response !== ''
        })
      )

      if (!allRequiredAnswered) {
        alert('Please answer all required questions before submitting.')
        return
      }
      
      // Convert form data to API format
      const submissionData = convertFormResponseToApiFormat(
        surveyId,
        employeeInfo,
        formResponses,
        completionTimeMinutes
      )
      
      // Submit to backend
      await ApiClient.submitResponse(submissionData)
      
      // Move to completion step
      setCurrentStep(totalSteps + 1)
    } catch (err: any) {
      console.error('Error submitting survey:', err)
      
      // Handle specific error cases
      if (err.message?.includes('unique constraint')) {
        alert('It appears you have already submitted this survey. Each person can only submit once per survey.')
      } else if (err.message?.includes('network')) {
        alert('Network error. Please check your internet connection and try again.')
      } else {
        alert('Failed to submit survey. Please try again. If the problem persists, contact your administrator.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isStepComplete = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      return Object.values(employeeInfo).every(value => value.trim() !== '')
    }
    
    const step = formSteps[stepIndex - 1]
    if (!step || !step.questions) return false
    
    return step.questions.every(q => {
      if (!q.required) return true
      
      const response = formResponses[q.id]
      
      // Handle undefined/empty responses
      if (response === undefined || response === null || response === '') {
        return false
      }
      
      // Handle object responses (with main/other structure)
      if (typeof response === 'object' && response !== null && !Array.isArray(response) && 'main' in response) {
        return response.main !== '' && response.main !== undefined && response.main !== null
      }
      
      // Handle array responses (checkboxes)
      if (Array.isArray(response)) {
        return response.length > 0
      }
      
      // Handle simple string/number responses
      return true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/surveys" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span>corp Survey
                </span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading survey...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your survey</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl text-destructive">Survey Unavailable</CardTitle>
            <CardDescription className="text-base">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/surveys">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Surveys
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl">Survey Not Found</CardTitle>
            <CardDescription>
              The requested survey could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/surveys">
              <Button className="w-full">
                Browse Available Surveys
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/surveys" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">i</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                <span className="text-primary">IXI</span>corp Survey
              </span>
            </Link>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps + 2}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Survey Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-lg text-muted-foreground">{survey.description}</p>
          )}
          {survey.end_date && (
            <p className="text-sm text-muted-foreground mt-2">
              Survey closes on {new Date(survey.end_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        {currentStep === 0 && (
          <EmployeeInfoForm
            employeeInfo={employeeInfo}
            setEmployeeInfo={setEmployeeInfo}
            onSubmit={handleEmployeeInfoSubmit}
          />
        )}

        {currentStep > 0 && currentStep <= totalSteps && formSteps[currentStep - 1] && (
          <QuestionForm
            step={formSteps[currentStep - 1]}
            responses={formResponses}
            onResponseChange={handleQuestionResponse}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSubmit={currentStep === totalSteps ? handleFormSubmit : undefined}
            isLastStep={currentStep === totalSteps}
            canProceed={isStepComplete(currentStep)}
            isSubmitting={submitting}
          />
        )}

        {currentStep === totalSteps + 1 && (
          <FormComplete 
            employeeInfo={employeeInfo} 
            surveyTitle={survey.title}
          />
        )}
      </div>
    </div>
  )
}