// app/api/admin/surveys/[id]/section-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

// Add proper type definition for responses
interface QuestionResponse {
  response_type: string
  number_response: number | null
  text_response: string | null
  object_response?: { main?: string | number } // Add the missing property
}

interface AuditResponse {
  response_type: string
  number_response: number | null
  text_response: string | null
  object_response?: { main?: string | number } // Add the missing property
}

function calculateVarianceAndStdDev(values: number[]): { variance: number | null, stdDev: number | null } {
  if (values.length === 0) return { variance: null, stdDev: null }
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  return { variance, stdDev }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    // Get survey section analytics
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey_sections')
      .select(`
        id,
        title,
        order_index,
        questions (
          id,
          question_type,
          question_responses (
            response_type,
            number_response,
            text_response,
            object_response
          )
        )
      `)
      .eq('survey_id', surveyId)
      .order('order_index')

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 })
    }

    // Get audit section analytics
    const { data: auditData, error: auditError } = await supabase
      .from('survey_sections')
      .select(`
        id,
        title,
        order_index,
        survey_audit_questions!survey_audit_questions_section_id_fkey (
          id,
          question_type,
          survey_audit_responses (
            response_type,
            number_response,
            text_response,
            object_response
          )
        )
      `)
      .eq('survey_id', surveyId)
      .order('order_index')

    if (auditError) {
      return NextResponse.json({ error: auditError.message }, { status: 500 })
    }

    // Process survey analytics
    const sectionAnalytics: SectionAnalytics[] = (surveyData || []).map(section => {
      const questions = section.questions || []
      const ratingQuestions = questions.filter(q => q.question_type === 'rating')
      const otherQuestions = questions.filter(q => q.question_type !== 'rating')
      
      // Get all rating responses for this section
      const allRatingValues: number[] = []
      ratingQuestions.forEach(question => {
        question.question_responses?.forEach((response: QuestionResponse) => {
          if (response.response_type === 'number' && response.number_response !== null) {
            allRatingValues.push(response.number_response)
          } else if (response.response_type === 'object' && response.object_response?.main) {
            const rating = Number(response.object_response.main)
            if (!isNaN(rating)) {
              allRatingValues.push(rating)
            }
          }
        })
      })

      // Calculate rating statistics
      const ratingAverage = allRatingValues.length > 0 
        ? allRatingValues.reduce((sum, val) => sum + val, 0) / allRatingValues.length 
        : null
      
      const { variance: ratingVariance, stdDev: ratingStdDev } = calculateVarianceAndStdDev(allRatingValues)

      // Count other question types
      const otherQuestionCounts = {
        text: otherQuestions.filter(q => q.question_type === 'text').length,
        yes_no: otherQuestions.filter(q => q.question_type === 'yes_no').length,
        radio: otherQuestions.filter(q => q.question_type === 'radio').length,
        checkbox: otherQuestions.filter(q => q.question_type === 'checkbox').length,
        select: otherQuestions.filter(q => q.question_type === 'select').length,
      }

      // Count total responses
      const totalResponses = questions.reduce((sum, q) => sum + (q.question_responses?.length || 0), 0)

      return {
        section_id: section.id,
        section_title: section.title,
        section_order: section.order_index,
        rating_average: ratingAverage,
        rating_count: allRatingValues.length,
        rating_variance: ratingVariance,
        rating_std_deviation: ratingStdDev,
        other_question_counts: otherQuestionCounts,
        total_questions: questions.length,
        total_responses: totalResponses
      }
    })

    // Process audit analytics
    const auditSectionAnalytics: AuditSectionAnalytics[] = (auditData || []).map(section => {
      const auditQuestions = section.survey_audit_questions || []
      const ratingAuditQuestions = auditQuestions.filter(q => q.question_type === 'rating')
      const otherAuditQuestions = auditQuestions.filter(q => q.question_type !== 'rating')
      
      // Get all audit rating responses for this section
      const allAuditRatingValues: number[] = []
      ratingAuditQuestions.forEach(question => {
        question.survey_audit_responses?.forEach((response: AuditResponse) => {
          if (response.response_type === 'number' && response.number_response !== null) {
            allAuditRatingValues.push(response.number_response)
          } else if (response.response_type === 'object' && response.object_response?.main) {
            const rating = Number(response.object_response.main)
            if (!isNaN(rating)) {
              allAuditRatingValues.push(rating)
            }
          }
        })
      })

      // Calculate audit rating statistics
      const auditRatingAverage = allAuditRatingValues.length > 0 
        ? allAuditRatingValues.reduce((sum, val) => sum + val, 0) / allAuditRatingValues.length 
        : null
      
      const { variance: auditRatingVariance, stdDev: auditRatingStdDev } = calculateVarianceAndStdDev(allAuditRatingValues)

      // Count other audit question types
      const auditOtherQuestionCounts = {
        text: otherAuditQuestions.filter(q => q.question_type === 'text').length,
        yes_no: otherAuditQuestions.filter(q => q.question_type === 'yes_no').length,
        radio: otherAuditQuestions.filter(q => q.question_type === 'radio').length,
        checkbox: otherAuditQuestions.filter(q => q.question_type === 'checkbox').length,
        select: otherAuditQuestions.filter(q => q.question_type === 'select').length,
      }

      // Count total audit responses
      const totalAuditResponses = auditQuestions.reduce((sum, q) => sum + (q.survey_audit_responses?.length || 0), 0)

      return {
        section_id: section.id,
        section_title: section.title,
        section_order: section.order_index,
        audit_rating_average: auditRatingAverage,
        audit_rating_count: allAuditRatingValues.length,
        audit_rating_variance: auditRatingVariance,
        audit_rating_std_deviation: auditRatingStdDev,
        audit_other_question_counts: auditOtherQuestionCounts,
        total_audit_questions: auditQuestions.length,
        total_audit_responses: totalAuditResponses
      }
    })

    // Calculate overall statistics
    const allSurveyRatings = sectionAnalytics.flatMap(section => {
      // We need to get the actual values, not just the averages
      const questions = surveyData?.find(s => s.id === section.section_id)?.questions || []
      const ratingQuestions = questions.filter(q => q.question_type === 'rating')
      const values: number[] = []
      
      ratingQuestions.forEach(question => {
        question.question_responses?.forEach((response: QuestionResponse) => {
          if (response.response_type === 'number' && response.number_response !== null) {
            values.push(response.number_response)
          } else if (response.response_type === 'object' && response.object_response?.main) {
            const rating = Number(response.object_response.main)
            if (!isNaN(rating)) {
              values.push(rating)
            }
          }
        })
      })
      
      return values
    })

    const allAuditRatings = auditSectionAnalytics.flatMap(section => {
      const auditQuestions = auditData?.find(s => s.id === section.section_id)?.survey_audit_questions || []
      const ratingAuditQuestions = auditQuestions.filter(q => q.question_type === 'rating')
      const values: number[] = []
      
      ratingAuditQuestions.forEach(question => {
        question.survey_audit_responses?.forEach((response: AuditResponse) => {
          if (response.response_type === 'number' && response.number_response !== null) {
            values.push(response.number_response)
          } else if (response.response_type === 'object' && response.object_response?.main) {
            const rating = Number(response.object_response.main)
            if (!isNaN(rating)) {
              values.push(rating)
            }
          }
        })
      })
      
      return values
    })

    const overallSurveyStats = calculateVarianceAndStdDev(allSurveyRatings)
    const overallAuditStats = calculateVarianceAndStdDev(allAuditRatings)

    const overallSurveyAverage = allSurveyRatings.length > 0 
      ? allSurveyRatings.reduce((sum, val) => sum + val, 0) / allSurveyRatings.length 
      : null

    const overallAuditAverage = allAuditRatings.length > 0 
      ? allAuditRatings.reduce((sum, val) => sum + val, 0) / allAuditRatings.length 
      : null

    return NextResponse.json({
      sectionAnalytics,
      auditSectionAnalytics,
      overallStatistics: {
        survey: {
          overall_average: overallSurveyAverage,
          overall_variance: overallSurveyStats.variance,
          overall_std_deviation: overallSurveyStats.stdDev,
          total_rating_responses: allSurveyRatings.length
        },
        audit: {
          overall_average: overallAuditAverage,
          overall_variance: overallAuditStats.variance,
          overall_std_deviation: overallAuditStats.stdDev,
          total_rating_responses: allAuditRatings.length
        }
      }
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}