// app/api/surveys/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'


// app/api/analytics/[surveyId]/route.ts - FIXED
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params // AWAIT params
    
    // Get survey responses count
    const { data: responseCount, error: countError } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact' })
      .eq('survey_id', surveyId)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Get department breakdown
    const { data: departmentBreakdown, error: deptError } = await supabase
      .from('survey_responses')
      .select('employee_department')
      .eq('survey_id', surveyId)

    if (deptError) {
      return NextResponse.json({ error: deptError.message }, { status: 500 })
    }

    // Get question analytics
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        *,
        survey_sections (
          *,
          questions (
            id,
            question_text,
            question_type,
            question_responses (
              response_type,
              text_response,
              number_response,
              array_response,
              object_response
            )
          )
        )
      `)
      .eq('id', surveyId)
      .single()

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 })
    }

    // Process analytics data
    const questionAnalytics = survey.survey_sections?.flatMap((section: any) =>
      section.questions?.map((question: any) => {
        const responses = question.question_responses || []
        const analytics: any = {
          id: question.id,
          question: question.question_text,
          type: question.question_type,
          responses: responses.length
        }

        if (question.question_type === 'rating') {
          const ratings = responses
            .map((r: any) => r.number_response || (r.object_response?.main))
            .filter((r: any) => r !== null && r !== undefined)
          
          if (ratings.length > 0) {
            analytics.avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            analytics.distribution = [1, 2, 3, 4, 5].map(rating => 
              ratings.filter((r: number) => r === rating).length
            )
          }
        } else if (question.question_type === 'yes_no') {
          const yesResponses = responses.filter((r: any) => 
            r.text_response === 'yes' || (r.object_response?.main === 'yes')
          ).length
          const noResponses = responses.filter((r: any) => 
            r.text_response === 'no' || (r.object_response?.main === 'no')
          ).length
          
          analytics.yesCount = yesResponses
          analytics.noCount = noResponses
        }

        return analytics
      })
    ) || []

    // Calculate department stats
    const deptStats = departmentBreakdown?.reduce((acc: any, response: any) => {
      const dept = response.employee_department
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})

    const departments = Object.entries(deptStats || {}).map(([name, count]) => ({
      name,
      responses: count,
      total: count, // This would need actual employee count from departments
      rate: 100 // This would be calculated based on total employees
    }))

    return NextResponse.json({
      overview: {
        totalResponses: responseCount?.length || 0,
        responseRate: 0, // Calculate based on total employees
        avgCompletionTime: 8.2, // Calculate from actual data
        lastUpdated: new Date().toISOString()
      },
      departments,
      questionAnalytics
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


