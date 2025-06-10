// app/admin/surveys/[id]/edit/page.tsx - SIMPLIFIED WITHOUT PUBLISH TOGGLE
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, AlertCircle, Loader2, Settings, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Survey, ApiClient } from '@/lib/utils'

export default function EditSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)
        const response = await ApiClient.getSurvey(surveyId)
        setSurvey(response.survey)
      } catch (err) {
        console.error('Error fetching survey:', err)
        setError('Failed to load survey')
      } finally {
        setLoading(false)
      }
    }

    if (surveyId) {
      fetchSurvey()
    }
  }, [surveyId])

  const handleSave = async () => {
    if (!survey) return

    try {
      setSaving(true)
      await ApiClient.updateSurvey(surveyId, survey)
      // Show success message or redirect
      router.push('/admin')
    } catch (err) {
      console.error('Error saving survey:', err)
      alert('Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const updateSurvey = (updates: Partial<Survey>) => {
    setSurvey(prev => prev ? { ...prev, ...updates } : null)
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
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading survey...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !survey) {
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
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Survey</CardTitle>
              <CardDescription>{error || 'Survey not found'}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()} variant="outline">
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
                <span className="text-xl font-bold text-foreground">Edit Survey</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/admin/analytics/${surveyId}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Survey Basic Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Survey Information</CardTitle>
            <CardDescription>Basic details about your survey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={survey.title}
                  onChange={(e) => updateSurvey({ title: e.target.value })}
                  placeholder="Enter survey title..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={survey.description || ''}
                  onChange={(e) => updateSurvey({ description: e.target.value })}
                  placeholder="Enter survey description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={survey.start_date ? survey.start_date.split('T')[0] : ''}
                  onChange={(e) => updateSurvey({ start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={survey.end_date ? survey.end_date.split('T')[0] : ''}
                  onChange={(e) => updateSurvey({ end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Simplified to only show Active status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_active" className="text-base font-medium">Active Survey</Label>
                <p className="text-sm text-muted-foreground">Active surveys are visible to employees</p>
              </div>
              <Switch
                id="is_active"
                checked={survey.is_active}
                onCheckedChange={(checked) => updateSurvey({ is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Survey Structure */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Survey Structure</CardTitle>
                <CardDescription>Sections and questions in your survey</CardDescription>
              </div>
              <Link href="/admin/questions">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Edit Questions
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {survey.survey_sections && survey.survey_sections.length > 0 ? (
              <div className="space-y-4">
                {survey.survey_sections
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h4 className="font-medium text-lg mb-2">{section.title}</h4>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {section.questions?.length || 0} questions in this section
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No sections or questions have been added yet.</p>
                <Link href="/admin/questions">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Section
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-medium mb-2">Survey Ready for Editing! 🎉</h3>
          <p className="text-green-700 text-sm">
            Your survey has been created. You can now add sections and questions using the "Edit Questions" button above.
            Don't forget to make the survey Active when you're ready for employees to participate.
          </p>
        </div>
      </div>
    </div>
  )
}