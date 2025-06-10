// app/admin/questions/page.tsx - COMPLETE UPDATED FILE
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Settings, Save, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Survey, Question, QuestionOption, ApiClient } from '@/lib/utils'

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'radio', label: 'Multiple Choice (Single)' },
  { value: 'checkbox', label: 'Multiple Choice (Multiple)' },
  { value: 'rating', label: '5-Star Rating' },
  { value: 'select', label: 'Dropdown' },
]

interface QuestionFormData {
  id?: string
  section_id: string
  question_text: string
  question_type: Question['question_type']
  is_required: boolean
  has_other_option: boolean
  order_index: number
  options: string[]
}

interface QuestionFormProps {
  question?: Question & { question_options?: QuestionOption[] }
  sectionId: string
  orderIndex: number
  onSave: (questionData: QuestionFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

function QuestionForm({ question, sectionId, orderIndex, onSave, onCancel, isSubmitting }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>({
    id: question?.id,
    section_id: sectionId,
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'text',
    is_required: question?.is_required ?? true,
    has_other_option: question?.has_other_option ?? false,
    order_index: question?.order_index ?? orderIndex,
    options: question?.question_options?.map(opt => opt.option_text) || []
  })

  const [optionInput, setOptionInput] = useState('')

  // Debug logging
  useEffect(() => {
    console.log('QuestionForm initialized with:', {
      sectionId,
      orderIndex,
      questionId: question?.id,
      formData
    })
  }, [sectionId, orderIndex, question, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question_text.trim()) {
      alert('Question text is required')
      return
    }

    if (!formData.section_id) {
      alert('Section ID is missing')
      return
    }

    console.log('Submitting question form:', formData)
    await onSave(formData)
  }

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }))
      setOptionInput('')
    }
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const requiresOptions = ['radio', 'checkbox', 'select'].includes(formData.question_type)

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{question ? 'Edit Question' : 'Add New Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value: Question['question_type']) => 
                  setFormData(prev => ({ ...prev, question_type: value, options: [] }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={formData.is_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                    className="rounded border-primary text-primary focus:ring-primary"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="required" className="text-sm">Required question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasOther"
                    checked={formData.has_other_option}
                    onChange={(e) => setFormData(prev => ({ ...prev, has_other_option: e.target.checked }))}
                    className="rounded border-primary text-primary focus:ring-primary"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="hasOther" className="text-sm">Include "Other" option</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Input
              id="question-text"
              placeholder="Enter your question..."
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              required
              disabled={isSubmitting}
            />
          </div>

          {requiresOptions && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an option..."
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  disabled={isSubmitting}
                />
                <Button type="button" onClick={addOption} variant="outline" disabled={isSubmitting}>
                  Add
                </Button>
              </div>
              {formData.options.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{option}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Question
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminQuestionsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showAddQuestion, setShowAddQuestion] = useState<string | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingSectionToSurvey, setAddingSectionToSurvey] = useState<string | null>(null)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching surveys...')
      
      // Use admin surveys endpoint to get all surveys
      const response = await fetch('/api/admin/surveys')
      if (response.ok) {
        const data = await response.json()
        console.log('Surveys loaded:', data.surveys?.length || 0)
        setSurveys(data.surveys || [])
      } else {
        console.log('Admin endpoint failed, falling back to public surveys')
        // Fallback to public surveys
        const publicSurveys = await ApiClient.getSurveys()
        setSurveys(publicSurveys.surveys || [])
      }
    } catch (err) {
      console.error('Error fetching surveys:', err)
      setError('Failed to load surveys')
    } finally {
      setLoading(false)
    }
  }

  const fetchSurveyDetails = async (surveyId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching survey details for:', surveyId)
      
      const response = await ApiClient.getSurvey(surveyId)
      console.log('Survey loaded:', response.survey)
      console.log('Sections found:', response.survey.survey_sections?.length || 0)
      
      // Log section details for debugging
      response.survey.survey_sections?.forEach((section, index) => {
        console.log(`Section ${index}:`, {
          id: section.id,
          title: section.title,
          questions: section.questions?.length || 0
        })
      })
      
      setSelectedSurvey(response.survey)
      
      // Reset any form states when switching surveys
      setEditingQuestion(null)
      setEditingSection(null)
      setShowAddQuestion(null)
      setNewSectionTitle('')
      setAddingSectionToSurvey(null)
      
    } catch (err) {
      console.error('Error fetching survey details:', err)
      setError('Failed to load survey details')
      setSelectedSurvey(null)
    } finally {
      setLoading(false)
    }
  }

  const addSection = async () => {
    if (!newSectionTitle.trim() || !selectedSurvey?.id) return

    try {
      setSubmitting(true)
      setError(null)
      
      console.log('Adding section:', { 
        survey_id: selectedSurvey.id, 
        title: newSectionTitle.trim() 
      })
      
      const response = await ApiClient.createSection({
        survey_id: selectedSurvey.id,
        title: newSectionTitle.trim(),
        description: '',
        order_index: 0 // Let the API calculate the correct order
      })

      console.log('Section created successfully:', response)

      // Reset form state
      setNewSectionTitle('')
      setAddingSectionToSurvey(null)
      
      // Refresh survey details
      await fetchSurveyDetails(selectedSurvey.id)
    } catch (err: any) {
      console.error('Error adding section:', err)
      const errorMessage = err.message || 'Failed to add section'
      setError(`Failed to add section: ${errorMessage}`)
      alert(`Failed to add section: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const updateSectionTitle = async (sectionId: string, title: string) => {
    try {
      setSubmitting(true)
      setError(null)
      
      const section = selectedSurvey?.survey_sections?.find(s => s.id === sectionId)
      if (!section) {
        throw new Error('Section not found')
      }

      console.log('Updating section:', sectionId, 'to:', title)

      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: section.description,
          order_index: section.order_index
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Section update failed:', errorText)
        throw new Error(`Failed to update section: ${response.status}`)
      }

      setEditingSection(null)
      
      // Refresh survey details
      if (selectedSurvey) {
        await fetchSurveyDetails(selectedSurvey.id)
      }
    } catch (err: any) {
      console.error('Error updating section:', err)
      const errorMessage = err.message || 'Failed to update section'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? This will also delete all questions in this section.')) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      console.log('Deleting section:', sectionId)
      
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Section deletion failed:', errorText)
        throw new Error(`Failed to delete section: ${response.status}`)
      }

      // Refresh survey details
      if (selectedSurvey) {
        await fetchSurveyDetails(selectedSurvey.id)
      }
    } catch (err: any) {
      console.error('Error deleting section:', err)
      const errorMessage = err.message || 'Failed to delete section'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const saveQuestion = async (questionData: QuestionFormData) => {
    try {
      setSubmitting(true)
      setError(null)
      
      console.log('Attempting to save question:', questionData)
      
      // Validate required data
      if (!questionData.section_id) {
        throw new Error('Section ID is required but missing')
      }
      
      if (!questionData.question_text?.trim()) {
        throw new Error('Question text is required')
      }
      
      // Verify the section exists in the current survey
      const sectionExists = selectedSurvey?.survey_sections?.some(s => s.id === questionData.section_id)
      if (!sectionExists) {
        throw new Error(`Section not found: ${questionData.section_id}`)
      }
      
      if (questionData.id) {
        // Update existing question
        console.log('Updating existing question:', questionData.id)
        
        const response = await fetch(`/api/questions/${questionData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Update failed:', errorText)
          throw new Error(`Failed to update question: ${response.status} ${response.statusText}`)
        }

        console.log('Question updated successfully')
      } else {
        // Create new question
        console.log('Creating new question for section:', questionData.section_id)
        
        // Remove order_index and id from the data - let API handle it
        const { id, order_index, ...cleanQuestionData } = questionData
        
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanQuestionData)
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Creation failed:', errorData)
          throw new Error(`Failed to create question: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Question created successfully:', result)
      }

      // Reset form state
      setEditingQuestion(null)
      setShowAddQuestion(null)
      
      // Reload the survey to see updated questions
      if (selectedSurvey) {
        console.log('Reloading survey data...')
        await fetchSurveyDetails(selectedSurvey.id)
      }
      
    } catch (err: any) {
      console.error('Error saving question:', err)
      const errorMessage = err.message || 'Unknown error occurred'
      setError(`Failed to save question: ${errorMessage}`)
      alert(`Failed to save question: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      
      console.log('Deleting question:', questionId)
      
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Question deletion failed:', errorText)
        throw new Error(`Failed to delete question: ${response.status}`)
      }

      // Refresh survey details
      if (selectedSurvey) {
        await fetchSurveyDetails(selectedSurvey.id)
      }
    } catch (err: any) {
      console.error('Error deleting question:', err)
      const errorMessage = err.message || 'Failed to delete question'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
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
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Question Management</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading surveys...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !selectedSurvey) {
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
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchSurveys} variant="outline">
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
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Question Management</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select 
                value={selectedSurvey?.id || ''} 
                onValueChange={async (surveyId) => {
                  if (surveyId) {
                    console.log('Survey selected from dropdown:', surveyId)
                    
                    // Clear any existing state first
                    setSelectedSurvey(null)
                    setEditingQuestion(null)
                    setEditingSection(null)
                    setShowAddQuestion(null)
                    setError(null)
                    
                    // Fetch the survey details
                    await fetchSurveyDetails(surveyId)
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a survey to edit..." />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map(survey => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!selectedSurvey ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Select a Survey</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Choose a survey from the dropdown above to start editing questions.
              </p>
              {surveys.length === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">No surveys found.</p>
                  <Link href="/admin/surveys/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Survey
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Survey Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">{selectedSurvey.title}</h1>
              {selectedSurvey.description && (
                <p className="text-lg text-muted-foreground">{selectedSurvey.description}</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-medium">Error</p>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setError(null)}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Add Question Form */}
            {(showAddQuestion || editingQuestion) && (
              <QuestionForm
                question={editingQuestion || undefined}
                sectionId={showAddQuestion || editingQuestion?.section_id || ''}
                orderIndex={
                  editingQuestion?.order_index ?? 
                  (selectedSurvey.survey_sections?.find(s => s.id === showAddQuestion)?.questions?.length || 0)
                }
                onSave={saveQuestion}
                onCancel={() => {
                  setShowAddQuestion(null)
                  setEditingQuestion(null)
                }}
                isSubmitting={submitting}
              />
            )}

            {/* Sections */}
            <div className="space-y-6">
              {selectedSurvey.survey_sections?.sort((a, b) => a.order_index - b.order_index).map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        {editingSection === section.id ? (
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const newTitle = e.target.value
                              setSelectedSurvey(prev => prev ? {
                                ...prev,
                                survey_sections: prev.survey_sections?.map(s => 
                                  s.id === section.id ? { ...s, title: newTitle } : s
                                )
                              } : null)
                            }}
                            onBlur={() => updateSectionTitle(section.id, section.title)}
                            onKeyPress={(e) => e.key === 'Enter' && updateSectionTitle(section.id, section.title)}
                            className="text-lg font-semibold"
                            autoFocus
                            disabled={submitting}
                          />
                        ) : (
                          <CardTitle 
                            className="text-xl cursor-pointer"
                            onClick={() => setEditingSection(section.id)}
                          >
                            {section.title}
                          </CardTitle>
                        )}
                        <span className="text-sm text-muted-foreground">
                          ({section.questions?.length || 0} questions)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('Add question clicked for section:', section.id)
                            
                            if (!section.id) {
                              setError('Section ID is missing. Please refresh and try again.')
                              return
                            }
                            
                            if (!selectedSurvey?.id) {
                              setError('No survey selected. Please select a survey first.')
                              return
                            }
                            
                            setError(null)
                            setShowAddQuestion(section.id)
                          }}
                          disabled={submitting || !section.id}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSection(section.id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!section.questions || section.questions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No questions in this section yet.</p>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (section.id) {
                              setShowAddQuestion(section.id)
                            } else {
                              setError('Section ID is missing')
                            }
                          }}
                          className="mt-2"
                          disabled={submitting || !section.id}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first question
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {section.questions.sort((a, b) => a.order_index - b.order_index).map((question) => (
                          <div key={question.id} className="flex items-start gap-3 p-4 border rounded-lg">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                      {questionTypes.find(t => t.value === question.question_type)?.label}
                                    </span>
                                    {question.is_required && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                        Required
                                      </span>
                                    )}
                                    {question.has_other_option && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        Has Other
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium mb-2">{question.question_text}</p>
                                  {question.question_options && question.question_options.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      Options: {question.question_options
                                        .sort((a, b) => a.order_index - b.order_index)
                                        .map(opt => opt.option_text)
                                        .join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingQuestion(question)}
                                    disabled={submitting}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteQuestion(question.id)}
                                    disabled={submitting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Add New Section */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New section title..."
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setAddingSectionToSurvey(selectedSurvey.id)
                          addSection()
                        }
                      }}
                      disabled={submitting}
                    />
                    <Button 
                      onClick={() => {
                        setAddingSectionToSurvey(selectedSurvey.id)
                        addSection()
                      }}
                      disabled={submitting || !newSectionTitle.trim()}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}