// app/api/surveys/[id]/public-response/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface SurveyResponseRequest {
  survey_id: string
  employee_info: {
    name: string
    designation: string
    department: string
    supervisor: string
    reportsTo: string
  }
  responses: Record<string, any> // Object with question_id as keys and responses as values
  completion_time_minutes?: number
  is_refill?: boolean
  response_attempt?: number
  submitted_at?: string
}

function determineResponseType(value: any): { 
  type: 'text' | 'number' | 'array' | 'object', 
  value: any 
} {
  // Check if it's a number (including rating values)
  if (typeof value === 'number') {
    return { type: 'number', value }
  }
  
  // Check if it's an array (for multi-select responses)
  if (Array.isArray(value)) {
    return { type: 'array', value }
  }
  
  // Check if it's an object
  if (typeof value === 'object' && value !== null) {
    return { type: 'object', value }
  }
  
  // Default to text response (including strings, yes/no, etc.)
  return { type: 'text', value: String(value) }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params
    const body: SurveyResponseRequest = await request.json()

    // Validate required fields
    if (!body.employee_info || !body.responses) {
      return NextResponse.json(
        { error: 'Employee info and responses are required' },
        { status: 400 }
      )
    }

    // Validate that responses is an object
    if (!body.responses || typeof body.responses !== 'object' || Array.isArray(body.responses)) {
      console.log('body.responses is not a valid object:', typeof body.responses, body.responses)
      return NextResponse.json(
        { error: 'Responses must be an object with question IDs as keys' },
        { status: 400 }
      )
    }

    // Check if survey exists and is active
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, is_active, is_published, start_date, end_date')
      .eq('id', surveyId)
      .single()

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    if (!survey.is_active || !survey.is_published) {
      return NextResponse.json(
        { error: 'Survey is not available for responses' },
        { status: 400 }
      )
    }

    // Check date constraints
    const now = new Date()
    if (survey.start_date && new Date(survey.start_date) > now) {
      return NextResponse.json(
        { error: 'Survey has not started yet' },
        { status: 400 }
      )
    }

    if (survey.end_date && new Date(survey.end_date) < now) {
      return NextResponse.json(
        { error: 'Survey has ended' },
        { status: 400 }
      )
    }

    // Create survey response record (matching the actual schema)
    const { data: surveyResponse, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        user_id: null, // Public response, no authenticated user
        assignment_id: null, // Public response, no assignment
        response_attempt: body.response_attempt || 1,
        is_refill: body.is_refill || false,
        submitted_at: body.submitted_at || new Date().toISOString(),
        completion_time_minutes: body.completion_time_minutes || null
      })
      .select()
      .single()

    if (responseError) {
      console.error('Error creating survey response:', responseError)
      return NextResponse.json(
        { error: 'Failed to save survey response' },
        { status: 500 }
      )
    }

    // Save individual question responses by iterating over the responses object
    const questionResponses = Object.entries(body.responses).map(([questionId, responseValue]) => {
      const { type, value } = determineResponseType(responseValue)
      
      return {
        survey_response_id: surveyResponse.id,
        question_id: questionId,
        response_type: type,
        text_response: type === 'text' ? value : null,
        number_response: type === 'number' ? value : null,
        array_response: type === 'array' ? value : null,
        object_response: type === 'object' ? value : null,
        created_at: new Date().toISOString()
      }
    })

    // Save question responses
    if (questionResponses.length > 0) {
      const { error: responsesError } = await supabase
        .from('question_responses')
        .insert(questionResponses)

      if (responsesError) {
        console.error('Error saving question responses:', responsesError)
        return NextResponse.json(
          { error: 'Failed to save survey responses' },
          { status: 500 }
        )
      }
    }

    // Log the submission with employee info for audit purposes
    console.log(`Survey response submitted:`, {
      survey_id: surveyId,
      survey_title: survey.title,
      employee: {
        name: body.employee_info.name,
        department: body.employee_info.department,
        designation: body.employee_info.designation
      },
      response_id: surveyResponse.id,
      question_count: questionResponses.length
    })

    console.log(`Survey response submitted for survey: ${survey.title} by: ${body.employee_info.name}`)

    return NextResponse.json({
      message: 'Survey response submitted successfully',
      response_id: surveyResponse.id,
      survey_title: survey.title
    }, { status: 201 })

  } catch (error) {
    console.error('Submit survey response error:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey response' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({
    message: 'Survey public response endpoint',
    methods: ['POST'],
    timestamp: new Date().toISOString()
  })
}