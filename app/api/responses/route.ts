// app/api/responses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      survey_id, 
      employee_info, 
      responses, 
      completion_time_minutes 
    } = body

    // First, create the survey response record
    const { data: surveyResponse, error: surveyError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id,
        employee_name: employee_info.name,
        employee_designation: employee_info.designation,
        employee_department: employee_info.department,
        employee_supervisor: employee_info.supervisor,
        employee_reports_to: employee_info.reportsTo,
        completion_time_minutes
      })
      .select()
      .single()

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 })
    }

    // Then, create individual question responses
    const questionResponses = Object.entries(responses).map(([questionId, response]) => {
      let responseType: 'text' | 'number' | 'array' | 'object'
      let textResponse = null
      let numberResponse = null
      let arrayResponse = null
      let objectResponse = null

      if (typeof response === 'string') {
        responseType = 'text'
        textResponse = response
      } else if (typeof response === 'number') {
        responseType = 'number'
        numberResponse = response
      } else if (Array.isArray(response)) {
        responseType = 'array'
        arrayResponse = response
      } else if (typeof response === 'object' && response !== null) {
        responseType = 'object'
        objectResponse = response
      } else {
        responseType = 'text'
        textResponse = String(response)
      }

      return {
        survey_response_id: surveyResponse.id,
        question_id: questionId,
        response_type: responseType,
        text_response: textResponse,
        number_response: numberResponse,
        array_response: arrayResponse,
        object_response: objectResponse
      }
    })

    const { error: responsesError } = await supabase
      .from('question_responses')
      .insert(questionResponses)

    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Survey response submitted successfully',
      response_id: surveyResponse.id 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


