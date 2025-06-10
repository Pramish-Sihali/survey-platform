// components/admin/AuditAnalyticsComparison.tsx
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3, AlertCircle, Star, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionAnalytics {
  section_id: string
  section_title: string
  section_order: number
  rating_average: number | null
  rating_count: number
  rating_variance: number | null
  rating_std_deviation: number | null
  other_question_counts: {
    text: number
    yes_no: number
    radio: number
    checkbox: number
    select: number
  }
  total_questions: number
  total_responses: number
}

interface AuditSectionAnalytics {
  section_id: string
  section_title: string
  section_order: number
  audit_rating_average: number | null
  audit_rating_count: number
  audit_rating_variance: number | null
  audit_rating_std_deviation: number | null
  audit_other_question_counts: {
    text: number
    yes_no: number
    radio: number
    checkbox: number
    select: number
  }
  total_audit_questions: number
  total_audit_responses: number
}

interface OverallStatistics {
  survey: {
    overall_average: number | null
    overall_variance: number | null
    overall_std_deviation: number | null
    total_rating_responses: number
  }
  audit: {
    overall_average: number | null
    overall_variance: number | null
    overall_std_deviation: number | null
    total_rating_responses: number
  }
}

interface SectionAnalyticsData {
  sectionAnalytics: SectionAnalytics[]
  auditSectionAnalytics: AuditSectionAnalytics[]
  overallStatistics: OverallStatistics
}

interface AuditAnalyticsComparisonProps {
  surveyId: string
}

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function AuditAnalyticsComparison({ surveyId }: AuditAnalyticsComparisonProps) {
  const [data, setData] = useState<SectionAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [surveyId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/surveys/${surveyId}/section-analytics`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Fix the formatNumber function to handle undefined values
  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    return num !== null && num !== undefined ? num.toFixed(decimals) : 'N/A'
  }

  const getRatingLabel = (rating: number | null): string => {
    if (rating === null) return 'N/A'
    const index = Math.round(rating) - 1
    return RATING_LABELS[index] || 'Unknown'
  }

  const getDifferenceIcon = (difference: number | null) => {
    if (difference === null) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (difference > 0.2) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (difference < -0.2) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getDifferenceColor = (difference: number | null): string => {
    if (difference === null) return 'text-muted-foreground'
    if (difference > 0.2) return 'text-green-600'
    if (difference < -0.2) return 'text-red-600'
    return 'text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics comparison...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground">{error || 'Failed to load analytics data'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Merge section data for comparison
  const mergedSections = data.sectionAnalytics.map(surveySection => {
    const auditSection = data.auditSectionAnalytics.find(
      audit => audit.section_id === surveySection.section_id
    )
    
    const difference = surveySection.rating_average !== null && auditSection?.audit_rating_average !== null
      ? auditSection.audit_rating_average - surveySection.rating_average
      : null

    return {
      ...surveySection,
      audit: auditSection,
      difference
    }
  })

  const overallDifference = data.overallStatistics.survey.overall_average !== null && 
    data.overallStatistics.audit.overall_average !== null
    ? data.overallStatistics.audit.overall_average - data.overallStatistics.survey.overall_average
    : null

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Survey Ratings Overview
            </CardTitle>
            <CardDescription>Statistical analysis of survey rating responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(data.overallStatistics.survey.overall_average)}
                </div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className="text-xs text-muted-foreground">
                  {data.overallStatistics.survey.overall_average && 
                    getRatingLabel(data.overallStatistics.survey.overall_average)
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {data.overallStatistics.survey.total_rating_responses}
                </div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Variance:</span>
                <span className="font-medium">{formatNumber(data.overallStatistics.survey.overall_variance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Std Deviation:</span>
                <span className="font-medium">{formatNumber(data.overallStatistics.survey.overall_std_deviation)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary" />
              Audit Ratings Overview
            </CardTitle>
            <CardDescription>Statistical analysis of audit rating responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {formatNumber(data.overallStatistics.audit.overall_average)}
                </div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className="text-xs text-muted-foreground">
                  {data.overallStatistics.audit.overall_average && 
                    getRatingLabel(data.overallStatistics.audit.overall_average)
                  }
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.overallStatistics.audit.total_rating_responses}
                </div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Variance:</span>
                <span className="font-medium">{formatNumber(data.overallStatistics.audit.overall_variance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Std Deviation:</span>
                <span className="font-medium">{formatNumber(data.overallStatistics.audit.overall_std_deviation)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Difference Card */}
      {overallDifference !== null && (
        <Card className={cn(
          "border-2",
          overallDifference > 0.2 ? "border-green-200 bg-green-50" :
          overallDifference < -0.2 ? "border-red-200 bg-red-50" :
          "border-gray-200 bg-gray-50"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              {getDifferenceIcon(overallDifference)}
              <div className="text-center">
                <div className={cn("text-3xl font-bold", getDifferenceColor(overallDifference))}>
                  {overallDifference > 0 ? '+' : ''}{formatNumber(overallDifference)}
                </div>
                <p className="text-sm text-muted-foreground">Overall Difference (Audit - Survey)</p>
                <p className="text-xs text-muted-foreground">
                  {overallDifference > 0.2 ? 'Audit ratings are significantly higher' :
                   overallDifference < -0.2 ? 'Survey ratings are significantly higher' :
                   'Ratings are similar'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Section-by-Section Comparison</CardTitle>
          <CardDescription>
            Detailed comparison of survey ratings vs audit ratings by section. 
            Focusing on rating questions (1-5 scale) for averages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Section</th>
                  <th className="text-center p-4 font-medium">Survey Average</th>
                  <th className="text-center p-4 font-medium">Audit Rating</th>
                  <th className="text-center p-4 font-medium">Difference</th>
                  <th className="text-center p-4 font-medium">Statistics</th>
                  <th className="text-center p-4 font-medium">Question Counts</th>
                </tr>
              </thead>
              <tbody>
                {mergedSections.map((section) => {
                  // Fix: Add null check for auditSection
                  const auditSection = section.audit
                  
                  // Add null check to prevent TypeScript error
                  if (!auditSection) {
                    return (
                      <tr key={section.section_id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <h4 className="font-medium">{section.section_title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {section.rating_count} survey ratings | 0 audit ratings
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-primary">
                              {formatNumber(section.rating_average)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {section.rating_average && getRatingLabel(section.rating_average)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              σ: {formatNumber(section.rating_std_deviation)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-muted-foreground">N/A</div>
                            <div className="text-xs text-muted-foreground">No audit data</div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Minus className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-muted-foreground">N/A</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>Survey Var: {formatNumber(section.rating_variance)}</div>
                            <div>Audit Var: N/A</div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-2">
                            <div className="text-xs">
                              <strong>Survey Questions:</strong>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                <span>Rating: {section.rating_count > 0 ? '✓' : '✗'}</span>
                                <span>Text: {section.other_question_counts.text}</span>
                                <span>Y/N: {section.other_question_counts.yes_no}</span>
                                <span>Radio: {section.other_question_counts.radio}</span>
                                <span>Check: {section.other_question_counts.checkbox}</span>
                                <span>Select: {section.other_question_counts.select}</span>
                              </div>
                            </div>
                            <div className="text-xs border-t pt-2">
                              <strong>Audit Questions:</strong>
                              <div className="text-muted-foreground">No audit data</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                  
                  return (
                    <tr key={section.section_id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <h4 className="font-medium">{section.section_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.rating_count} survey ratings | {auditSection?.audit_rating_count || 0} audit ratings
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-primary">
                            {formatNumber(section.rating_average)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {section.rating_average && getRatingLabel(section.rating_average)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            σ: {formatNumber(section.rating_std_deviation)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-secondary">
                            {formatNumber(auditSection?.audit_rating_average)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {auditSection?.audit_rating_average && getRatingLabel(auditSection.audit_rating_average)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            σ: {formatNumber(auditSection?.audit_rating_std_deviation)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getDifferenceIcon(section.difference)}
                          <span className={cn("font-medium", getDifferenceColor(section.difference))}>
                            {section.difference !== null ? (
                              `${section.difference > 0 ? '+' : ''}${formatNumber(section.difference)}`
                            ) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Survey Var: {formatNumber(section.rating_variance)}</div>
                          <div>Audit Var: {formatNumber(auditSection?.audit_rating_variance)}</div>
                        </div>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="space-y-2">
                          <div className="text-xs">
                            <strong>Survey Questions:</strong>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <span>Rating: {section.rating_count > 0 ? '✓' : '✗'}</span>
                              <span>Text: {section.other_question_counts.text}</span>
                              <span>Y/N: {section.other_question_counts.yes_no}</span>
                              <span>Radio: {section.other_question_counts.radio}</span>
                              <span>Check: {section.other_question_counts.checkbox}</span>
                              <span>Select: {section.other_question_counts.select}</span>
                            </div>
                          </div>
                          <div className="text-xs border-t pt-2">
                            <strong>Audit Questions:</strong>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              <span>Rating: {(auditSection?.audit_rating_count || 0) > 0 ? '✓' : '✗'}</span>
                              <span>Text: {auditSection?.audit_other_question_counts.text || 0}</span>
                              <span>Y/N: {auditSection?.audit_other_question_counts.yes_no || 0}</span>
                              <span>Radio: {auditSection?.audit_other_question_counts.radio || 0}</span>
                              <span>Check: {auditSection?.audit_other_question_counts.checkbox || 0}</span>
                              <span>Select: {auditSection?.audit_other_question_counts.select || 0}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {mergedSections.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No sections with rating data found. Ensure both survey responses and audit responses exist.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Quality Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Insights</CardTitle>
          <CardDescription>Key observations about the rating comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Survey Data Quality</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sections with rating data:</span>
                  <span className="font-medium">
                    {data.sectionAnalytics.filter(s => s.rating_count > 0).length} / {data.sectionAnalytics.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total rating responses:</span>
                  <span className="font-medium">{data.overallStatistics.survey.total_rating_responses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average responses per section:</span>
                  <span className="font-medium">
                    {data.sectionAnalytics.length > 0 
                      ? Math.round(data.overallStatistics.survey.total_rating_responses / data.sectionAnalytics.length)
                      : 0
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Audit Data Quality</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sections with audit data:</span>
                  <span className="font-medium">
                    {data.auditSectionAnalytics.filter(s => s.audit_rating_count > 0).length} / {data.auditSectionAnalytics.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total audit responses:</span>
                  <span className="font-medium">{data.overallStatistics.audit.total_rating_responses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion rate:</span>
                  <span className="font-medium">
                    {data.auditSectionAnalytics.length > 0 && data.overallStatistics.audit.total_rating_responses > 0
                      ? Math.round((data.auditSectionAnalytics.filter(s => s.audit_rating_count > 0).length / data.auditSectionAnalytics.length) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}