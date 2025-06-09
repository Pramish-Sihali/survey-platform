'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Settings, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormStep, Question } from '@/lib/utils'

// Mock data - this would come from your backend
const initialSections: FormStep[] = [
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
  }
]

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'radio', label: 'Multiple Choice (Single)' },
  { value: 'checkbox', label: 'Multiple Choice (Multiple)' },
  { value: 'rating', label: '5-Star Rating' },
  { value: 'select', label: 'Dropdown' },
]

interface QuestionFormProps {
  question?: Question
  onSave: (question: Question) => void
  onCancel: () => void
}

function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState<Question>(
    question || {
      id: '',
      type: 'text',
      question: '',
      required: true,
      options: [],
      hasOther: false,
    }
  )

  const [optionInput, setOptionInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question.trim()) return

    const newQuestion: Question = {
      ...formData,
      id: formData.id || `q${Date.now()}`,
    }

    onSave(newQuestion)
  }

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), optionInput.trim()]
      }))
      setOptionInput('')
    }
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }))
  }

  const requiresOptions = ['radio', 'checkbox', 'select'].includes(formData.type)

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
                value={formData.type}
                onValueChange={(value: Question['type']) => 
                  setFormData(prev => ({ ...prev, type: value, options: [] }))
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
              <Label>Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={formData.required}
                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-primary text-primary focus:ring-primary"
                  />
                  <Label htmlFor="required" className="text-sm">Required question</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasOther"
                    checked={formData.hasOther}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasOther: e.target.checked }))}
                    className="rounded border-primary text-primary focus:ring-primary"
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
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              required
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
                />
                <Button type="button" onClick={addOption} variant="outline">
                  Add
                </Button>
              </div>
              {formData.options && formData.options.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{option}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Question
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function QuestionsPage() {
  const [sections, setSections] = useState<FormStep[]>(initialSections)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showAddQuestion, setShowAddQuestion] = useState<string | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')

  const addSection = () => {
    if (newSectionTitle.trim()) {
      const newSection: FormStep = {
        id: `section-${Date.now()}`,
        title: newSectionTitle.trim(),
        questions: []
      }
      setSections(prev => [...prev, newSection])
      setNewSectionTitle('')
    }
  }

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, title } : section
      )
    )
    setEditingSection(null)
  }

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId))
  }

  const addQuestion = (sectionId: string, question: Question) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, questions: [...section.questions, question] }
          : section
      )
    )
    setShowAddQuestion(null)
  }

  const updateQuestion = (sectionId: string, updatedQuestion: Question) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              questions: section.questions.map(q => 
                q.id === updatedQuestion.id ? updatedQuestion : q
              )
            }
          : section
      )
    )
    setEditingQuestion(null)
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
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
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Add Question Form */}
        {(showAddQuestion || editingQuestion) && (
          <QuestionForm
            question={editingQuestion || undefined}
            onSave={(question) => {
              if (editingQuestion) {
                const sectionId = sections.find(s => 
                  s.questions.some(q => q.id === editingQuestion.id)
                )?.id
                if (sectionId) updateQuestion(sectionId, question)
              } else if (showAddQuestion) {
                addQuestion(showAddQuestion, question)
              }
            }}
            onCancel={() => {
              setShowAddQuestion(null)
              setEditingQuestion(null)
            }}
          />
        )}

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    {editingSection === section.id ? (
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        onBlur={() => setEditingSection(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                        className="text-lg font-semibold"
                        autoFocus
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
                      ({section.questions.length} questions)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddQuestion(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {section.questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No questions in this section yet.</p>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddQuestion(section.id)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                  {questionTypes.find(t => t.value === question.type)?.label}
                                </span>
                                {question.required && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    Required
                                  </span>
                                )}
                                {question.hasOther && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Has Other
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium mb-2">{question.question}</p>
                              {question.options && question.options.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Options: {question.options.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingQuestion(question)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteQuestion(section.id, question.id)}
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
                  onKeyPress={(e) => e.key === 'Enter' && addSection()}
                />
                <Button onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}