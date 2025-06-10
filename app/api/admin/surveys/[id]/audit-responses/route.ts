
// app/api/admin/surveys/[id]/audit-responses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    const { data: auditResponses, error } = await supabase
      .from('survey_audit_responses')
      .select(`
        *,
        survey_audit_questions (
          question_text,
          question_type,
          category
        )
      `)
      .eq('survey_id', surveyId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ auditResponses })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params
    const body = await request.json()
    const { responses, responded_by } = body

    // Process each response
    const responsePromises = Object.entries(responses).map(async ([questionId, response]) => {
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

      // Upsert the response (insert or update if exists)
      return supabase
        .from('survey_audit_responses')
        .upsert({
          survey_id: surveyId,
          survey_audit_question_id: questionId,
          response_type: responseType,
          text_response: textResponse,
          number_response: numberResponse,
          array_response: arrayResponse,
          object_response: objectResponse,
          responded_by: responded_by || 'admin'
        }, {
          onConflict: 'survey_id,survey_audit_question_id'
        })
    })

    const results = await Promise.all(responsePromises)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Failed to save some responses' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Audit responses saved successfully' })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}