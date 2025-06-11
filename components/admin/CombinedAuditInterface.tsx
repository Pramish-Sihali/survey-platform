// components/admin/CombinedAuditInterface.tsx - PRODUCTION VERSION
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit3, Save, Trash2, Star, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

interface SurveySection {
  id: string
  title: string
  description: string | null
  order_index: number
}

interface AuditQuestion {
  id: string
  survey_id: string
  section_id: string | null
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
  category: string
  description: string | null
  survey_audit_question_options?: Array<{ option_text: string; order_index: number }>
  survey_sections?: SurveySection
}

interface AuditResponse {
  survey_audit_question_id: string
  response_type: string
  text_response?: string
  number_response?: number
  array_response?: string[]
  object_response?: any
}

interface SectionData {
  section: SurveySection
  questions: AuditQuestion[]
}

interface NewQuestionForm {
  section_id: string
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
  description: string
  category: string
  options: string[]
}

interface CombinedAuditInterfaceProps {
  surveyId: string
}

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'radio', label: 'Multiple Choice (Single)' },
  { value: 'checkbox', label: 'Multiple Choice (Multiple)' },
  { value: 'rating', label: '5-Star Rating' },
  { value: 'select', label: 'Dropdown' },
] as const

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function CombinedAuditInterface({ surveyId }: CombinedAuditInterfaceProps) {
  const [auditQuestionsBySection, setAuditQuestionsBySection] = useState<Record<string, SectionData>>({})
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [availableSections, setAvailableSections] = useState<SurveySection[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'partial' | 'failed'>('unknown')

  // New question form state
  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({
    section_id: '',
    question_text: '',
    question_type: 'text',
    is_required: true,
    has_other_option: false,
    description: '',
    category: 'General',
    options: []
  })
  const [optionInput, setOptionInput] = useState('')

  useEffect(() => {
    fetchData()
  }, [surveyId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setErrors([])
      setApiStatus('unknown')
      
      // Fetch survey sections
      const sectionsResponse = await fetch(`/api/admin/surveys/${surveyId}/survey-sections`)
      
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json()
        setAvailableSections(sectionsData.sections || [])
      } else {
        const error = `Failed to fetch sections: ${sectionsResponse.status}`
        setErrors((prev: string[]) => [...prev, error])
      }

      // Fetch audit questions and responses
      const [questionsResponse, responsesResponse] = await Promise.all([
        fetch(`/api/admin/surveys/${surveyId}/audit-questions`),
        fetch(`/api/admin/surveys/${surveyId}/audit-responses`)
      ])

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setAuditQuestionsBySection(questionsData.auditQuestionsBySection || {})
        setApiStatus('working')
        
        // Auto-expand first section
        const firstSectionId = Object.keys(questionsData.auditQuestionsBySection || {})[0]
        if (firstSectionId) {
          setExpandedSections(new Set([firstSectionId]))
        }
      } else {
        const errorText = await questionsResponse.text()
        const error = `Failed to fetch questions: ${questionsResponse.status} - ${errorText}`
        setErrors((prev: string[]) => [...prev, error])
        setApiStatus('failed')
      }

      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json()
        const responseMap: Record<string, any> = {}
        responsesData.auditResponses?.forEach((response: AuditResponse) => {
          const questionId = response.survey_audit_question_id
          switch (response.response_type) {
            case 'text':
              responseMap[questionId] = response.text_response || ''
              break
            case 'number':
              responseMap[questionId] = response.number_response || 0
              break
            case 'array':
              responseMap[questionId] = response.array_response || []
              break
            case 'object':
              responseMap[questionId] = response.object_response || {}
              break
          }
        })
        setResponses(responseMap)
      } else {
        const error = `Failed to fetch responses: ${responsesResponse.status}`
        setErrors((prev: string[]) => [...prev, error])
        if (apiStatus === 'working') {
          setApiStatus('partial')
        }
      }
    } catch (error) {
      setErrors((prev: string[]) => [...prev, `Fetch error: ${error}`])
      setApiStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev: Record<string, any>) => ({ ...prev, [questionId]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/admin/surveys/${surveyId}/audit-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          responded_by: 'admin'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save responses')
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving responses:', error)
      alert('Failed to save responses')
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => {
    if (optionInput.trim()) {
      setNewQuestion((prev: NewQuestionForm) => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }))
      setOptionInput('')
    }
  }

  const removeOption = (index: number) => {
    setNewQuestion((prev: NewQuestionForm) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const handleAddQuestion = async (sectionId: string) => {
    try {
      const requiresOptions = ['radio', 'checkbox', 'select'].includes(newQuestion.question_type)
      
      if (!newQuestion.question_text.trim()) {
        alert('Question text is required')
        return
      }

      if (requiresOptions && newQuestion.options.length === 0) {
        alert('At least one option is required for this question type')
        return
      }

      const response = await fetch(`/api/admin/surveys/${surveyId}/audit-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          section_id: sectionId,
          options: requiresOptions ? newQuestion.options : undefined,
          created_by: 'admin'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create question: ${response.status} - ${errorText}`)
      }

      // Reset form
      setNewQuestion({
        section_id: '',
        question_text: '',
        question_type: 'text',
        is_required: true,
        has_other_option: false,
        description: '',
        category: 'General',
        options: []
      })
      setOptionInput('')
      setShowAddQuestion(null)
      
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error adding question:', error)
      alert(`Failed to add question: ${error}`)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/audit-questions/${questionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete question')
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  const renderResponseField = (question: AuditQuestion) => {
    const response = responses[question.id]

    switch (question.question_type) {
      case 'text':
        return (
          <Input
            placeholder="Enter your response..."
            value={response || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            disabled={!isEditing}
            className={cn(
              "mt-2",
              isEditing && "border-blue-300 bg-blue-50 focus:border-blue-500"
            )}
          />
        )

      case 'yes_no':
        return (
          <RadioGroup
            value={response || ''}
            onValueChange={(value) => handleResponseChange(question.id, value)}
            disabled={!isEditing}
            className="mt-2"
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
            disabled={!isEditing}
            className="mt-2"
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
          <div className="space-y-3 mt-2">
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
                  disabled={!isEditing}
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
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => isEditing && handleResponseChange(question.id, rating)}
                  disabled={!isEditing}
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all",
                    ratingValue === rating
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30",
                    isEditing && "hover:scale-105 hover:border-primary/50"
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
            disabled={!isEditing}
          >
            <SelectTrigger className={cn(
              "mt-2",
              isEditing && "border-blue-300 bg-blue-50 focus:border-blue-500"
            )}>
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

  const renderAddQuestionForm = (sectionId: string) => {
    const requiresOptions = ['radio', 'checkbox', 'select'].includes(newQuestion.question_type)

    return (
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={newQuestion.question_type}
                  onValueChange={(value: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select') => 
                    setNewQuestion((prev: NewQuestionForm) => ({ ...prev, question_type: value, options: [] }))
                  }
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
                <Label>Category</Label>
                <Select
                  value={newQuestion.category}
                  onValueChange={(value) => setNewQuestion((prev: NewQuestionForm) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Data Quality">Data Quality</SelectItem>
                    <SelectItem value="Response Analysis">Response Analysis</SelectItem>
                    <SelectItem value="Key Insights">Key Insights</SelectItem>
                    <SelectItem value="Action Items">Action Items</SelectItem>
                    <SelectItem value="Priority Assessment">Priority Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Input
                  placeholder="Enter your question..."
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion((prev: NewQuestionForm) => ({ ...prev, question_text: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Optional description..."
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion((prev: NewQuestionForm) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newQuestion.is_required}
                  onChange={(e) => setNewQuestion((prev: NewQuestionForm) => ({ ...prev, is_required: e.target.checked }))}
                />
                <Label htmlFor="required" className="text-sm">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasOther"
                  checked={newQuestion.has_other_option}
                  onChange={(e) => setNewQuestion((prev: NewQuestionForm) => ({ ...prev, has_other_option: e.target.checked }))}
                />
                <Label htmlFor="hasOther" className="text-sm">Has Other</Label>
              </div>
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
                  />
                  <Button type="button" onClick={addOption} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{option}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddQuestion(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleAddQuestion(sectionId)}>
                Add Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading audit interface...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {apiStatus !== 'working' && errors.length > 0 && (
        <Card className={cn(
          "border-2",
          apiStatus === 'failed' ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "flex items-center gap-2",
              apiStatus === 'failed' ? "text-red-800" : "text-yellow-800"
            )}>
              <AlertTriangle className="h-5 w-5" />
              {apiStatus === 'failed' ? 'Connection Issues' : 'Partial Functionality'}
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            "text-sm",
            apiStatus === 'failed' ? "text-red-700" : "text-yellow-700"
          )}>
            <div className="space-y-2">
              {errors.length > 0 && (
                <div>
                  <strong>Issues:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchData}
                  className="text-current border-current hover:bg-current/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Edit/Save buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Questions & Responses</h2>
          <p className="text-muted-foreground">
            Manage audit questions and provide responses for survey evaluation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Sections */}
      {Object.keys(auditQuestionsBySection).length === 0 && apiStatus === 'working' ? (
        <Card>
          <CardContent className="text-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audit Questions</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding audit questions to evaluate this survey's data and insights.
            </p>
            {availableSections.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Available sections to add questions to:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableSections.map(section => (
                    <Button
                      key={section.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddQuestion(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {section.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(auditQuestionsBySection)
            .sort(([, a], [, b]) => a.section.order_index - b.section.order_index)
            .map(([sectionId, sectionData]) => (
            <Card key={sectionId} className={cn(
              "transition-all",
              isEditing && "border-blue-200 bg-blue-50/30"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    {expandedSections.has(sectionId) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <CardTitle className="text-lg">{sectionData.section.title}</CardTitle>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                      {sectionData.questions.length}
                    </span>
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddQuestion(sectionId)}
                    disabled={showAddQuestion !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                {sectionData.section.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {sectionData.section.description}
                  </p>
                )}
              </CardHeader>
              
              {expandedSections.has(sectionId) && (
                <CardContent className="space-y-6">
                  {/* Add Question Form */}
                  {showAddQuestion === sectionId && renderAddQuestionForm(sectionId)}
                  
                  {/* Questions */}
                  {sectionData.questions.map((question) => (
                    <div key={question.id} className={cn(
                      "border rounded-lg p-4 space-y-3",
                      isEditing && "border-blue-200 bg-blue-50/50"
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {questionTypes.find(t => t.value === question.question_type)?.label}
                            </span>
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                              {question.category}
                            </span>
                            {question.is_required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{question.question_text}</h4>
                          {question.description && (
                            <p className="text-sm text-muted-foreground mb-3">{question.description}</p>
                          )}
                          
                          {/* Response Field */}
                          {renderResponseField(question)}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {sectionData.questions.length === 0 && showAddQuestion !== sectionId && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No questions in this section yet.</p>
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddQuestion(sectionId)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add your first question
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}