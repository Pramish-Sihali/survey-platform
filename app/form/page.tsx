'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmployeeInfoForm } from '@/components/forms/EmployeeInfoForm'
import { QuestionForm } from '@/components/forms/QuestionForm'
import { FormComplete } from '@/components/forms/FormComplete'
import { EmployeeInfo, FormStep, FormResponses, FormResponseValue } from '@/lib/utils'

// Mock data - this would come from your backend
const mockFormSteps: FormStep[] = [
  {
    id: 'section-1',
    title: 'Work Environment & Culture',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How would you rate your overall job satisfaction?',
        required: true,
      },
      {
        id: 'q2',
        type: 'yes_no',
        question: 'Do you feel valued and appreciated at work?',
        required: true,
        hasOther: true,
      },
      {
        id: 'q3',
        type: 'text',
        question: 'What aspects of your work environment could be improved?',
        required: false,
      },
    ]
  },
  {
    id: 'section-2',
    title: 'Management & Leadership',
    questions: [
      {
        id: 'q4',
        type: 'rating',
        question: 'How effectively does your supervisor communicate with you?',
        required: true,
      },
      {
        id: 'q5',
        type: 'radio',
        question: 'How often do you receive feedback about your performance?',
        options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Rarely', 'Never'],
        required: true,
        hasOther: true,
      },
    ]
  },
  {
    id: 'section-3',
    title: 'Professional Development',
    questions: [
      {
        id: 'q6',
        type: 'checkbox',
        question: 'What professional development opportunities interest you most?',
        options: ['Technical Training', 'Leadership Development', 'Certifications', 'Conferences', 'Mentoring'],
        required: false,
        hasOther: true,
      },
      {
        id: 'q7',
        type: 'rating',
        question: 'How satisfied are you with current learning opportunities?',
        required: true,
      },
    ]
  }
]

export default function FormPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: '',
    designation: '',
    department: '',
    supervisor: '',
    reportsTo: '',
  })
  const [formResponses, setFormResponses] = useState<FormResponses>({})
  const [isFormClosed] = useState(false)

  // Check if form is closed (this would come from your backend)
  useEffect(() => {
    // Mock API call to check form status
    const checkFormStatus = async () => {
      // setIsFormClosed(true) // Uncomment to test closed form
    }
    checkFormStatus()
  }, [])

  const totalSteps = mockFormSteps.length // Number of question sections
  const progress = ((currentStep + 1) / (totalSteps + 2)) * 100 // +2 for employee info + completion

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
    // Here you would submit to your backend
    console.log('Submitting form:', { employeeInfo, formResponses })
    setCurrentStep(totalSteps + 1) // Move to completion step
  }

  const isStepComplete = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      return Object.values(employeeInfo).every(value => value.trim() !== '')
    }
    
    const step = mockFormSteps[stepIndex - 1]
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
        return response.main !== '' && response.main !== undefined
      }
      
      // Handle array responses (checkboxes)
      if (Array.isArray(response)) {
        return response.length > 0
      }
      
      // Handle simple string/number responses
      return true
    })
  }

  if (isFormClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Survey Closed</CardTitle>
            <CardDescription>
              This survey is currently not accepting responses. Please contact your administrator for more information.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return Home
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
            <Link href="/" className="flex items-center space-x-2">
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

        {currentStep > 0 && currentStep <= totalSteps && (
          <QuestionForm
            step={mockFormSteps[currentStep - 1]}
            responses={formResponses}
            onResponseChange={handleQuestionResponse}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSubmit={currentStep === totalSteps ? handleFormSubmit : undefined}
            isLastStep={currentStep === totalSteps}
            canProceed={isStepComplete(currentStep)}
          />
        )}

        {currentStep === totalSteps + 1 && (
          <FormComplete employeeInfo={employeeInfo} />
        )}
      </div>
    </div>
  )
}