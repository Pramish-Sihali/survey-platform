'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApiClient, Survey } from '@/lib/utils'

interface SurveyFormData {
  title: string
  description: string
  is_active: boolean
  is_published: boolean
  start_date: string
  end_date: string
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    is_active: true,
    is_published: false,
    start_date: '',
    end_date: ''
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Survey title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Survey title must be at least 3 characters'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    if (formData.start_date && new Date(formData.start_date) < new Date()) {
      newErrors.start_date = 'Start date cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      
      const surveyData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      }

      const response = await ApiClient.createSurvey(surveyData)
      
      // Redirect to edit the survey to add sections and questions
      router.push(`/admin/surveys/${response.survey.id}/edit`)
    } catch (err: any) {
      console.error('Error creating survey:', err)
      
      if (err.message?.includes('unique constraint')) {
        setErrors({ title: 'A survey with this title already exists' })
      } else {
        alert('Failed to create survey. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: keyof SurveyFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Set default dates
  const today = formatDateForInput(new Date())
  const nextMonth = formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

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
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">+</span>
                </div>
                <span className="text-xl font-bold text-foreground">Create New Survey</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Survey Details</CardTitle>
            <CardDescription>
              Create a new survey to collect employee feedback. You'll be able to add sections and questions after creating the survey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Survey Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Employee Satisfaction Survey 2024"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                    disabled={submitting}
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the survey purpose and scope"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    disabled={submitting}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    This description will be shown to employees when they view available surveys
                  </p>
                </div>
              </div>

              {/* Date Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Survey Schedule
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => updateField('start_date', e.target.value)}
                      className={errors.start_date ? 'border-destructive' : ''}
                      disabled={submitting}
                      min={today}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-destructive">{errors.start_date}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty to start immediately
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => updateField('end_date', e.target.value)}
                      className={errors.end_date ? 'border-destructive' : ''}
                      disabled={submitting}
                      min={formData.start_date || today}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-destructive">{errors.end_date}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty for no deadline
                    </p>
                  </div>
                </div>
              </div>

              {/* Survey Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Survey Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="is_active" className="text-base font-medium">
                        Active Survey
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Inactive surveys cannot be accessed by employees
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => updateField('is_active', checked)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="is_published" className="text-base font-medium">
                        Published
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Published surveys are visible to employees. You can publish later after adding questions.
                      </p>
                    </div>
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => updateField('is_published', checked)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Next Steps</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      After creating this survey, you'll be able to add sections and questions. 
                      Remember to publish the survey when you're ready for employees to participate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6">
                <Link href="/admin">
                  <Button type="button" variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Survey...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Survey
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}