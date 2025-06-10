// components/admin/AuditQuestionForm.tsx
'use client'

import { useState } from 'react'
import { Plus, X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuditQuestion {
  id?: string
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
  category: string
  description: string
  survey_audit_question_options?: Array<{ option_text: string }>
}

interface AuditQuestionFormProps {
  surveyId: string
  question?: AuditQuestion
  onSave: () => void
  onCancel: () => void
}

const questionTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'radio', label: 'Multiple Choice (Single)' },
  { value: 'checkbox', label: 'Multiple Choice (Multiple)' },
  { value: 'rating', label: '5-Star Rating' },
  { value: 'select', label: 'Dropdown' },
]

const categories = [
  'Data Quality',
  'Response Analysis', 
  'Key Insights',
  'Action Items',
  'Priority Assessment',
  'General'
]

export function AuditQuestionForm({ surveyId, question, onSave, onCancel }: AuditQuestionFormProps) {
  const [formData, setFormData] = useState<AuditQuestion>({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'text',
    is_required: question?.is_required ?? true,
    has_other_option: question?.has_other_option ?? false,
    category: question?.category || 'General',
    description: question?.description || ''
  })

  const [options, setOptions] = useState<string[]>(
    question?.survey_audit_question_options?.map(opt => opt.option_text) || []
  )
  const [optionInput, setOptionInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const requiresOptions = ['radio', 'checkbox', 'select'].includes(formData.question_type)

  const addOption = () => {
    if (optionInput.trim()) {
      setOptions(prev => [...prev, optionInput.trim()])
      setOptionInput('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.question_text.trim()) {
      alert('Question text is required')
      return
    }

    if (requiresOptions && options.length === 0) {
      alert('At least one option is required for this question type')
      return
    }

    try {
      setSubmitting(true)
      
      const endpoint = question?.id 
        ? `/api/admin/audit-questions/${question.id}`
        : `/api/admin/surveys/${surveyId}/audit-questions`
      
      const method = question?.id ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          options: requiresOptions ? options : undefined,
          created_by: 'admin'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save audit question')
      }

      onSave()
    } catch (error) {
      console.error('Error saving audit question:', error)
      alert('Failed to save audit question')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question ? 'Edit Audit Question' : 'Add Audit Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value: any) => {
                  setFormData(prev => ({ ...prev, question_type: value }))
                  setOptions([]) // Clear options when changing type
                }}
                disabled={submitting}
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Input
              id="question-text"
              placeholder="Enter your audit question..."
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Why is this question important for auditing?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                  disabled={submitting}
                />
                <Label htmlFor="required" className="text-sm">Required question</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasOther"
                  checked={formData.has_other_option}
                  onChange={(e) => setFormData(prev => ({ ...prev, has_other_option: e.target.checked }))}
                  disabled={submitting}
                />
                <Label htmlFor="hasOther" className="text-sm">Include &quot;Other&quot; option</Label>
              </div>
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
                  disabled={submitting}
                />
                <Button type="button" onClick={addOption} variant="outline" disabled={submitting}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="space-y-2 mt-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{option}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        disabled={submitting}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
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

