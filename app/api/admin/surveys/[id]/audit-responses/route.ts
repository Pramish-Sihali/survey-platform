// app/api/admin/surveys/[id]/audit-responses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    // Fetch audit responses for this survey
    const { data: auditResponses, error } = await supabase
      .from('survey_audit_responses')
      .select(`
        *,
        survey_audit_questions!inner (
          survey_id
        )
      `)
      .eq('survey_audit_questions.survey_id', surveyId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      auditResponses: auditResponses || []
    })
  } catch (error) {
    console.error('Error fetching audit responses:', error)
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

    // First, delete existing responses for this survey (if updating)
    const { error: deleteError } = await supabase
      .from('survey_audit_responses')
      .delete()
      .in('survey_audit_question_id', 
        await supabase
          .from('survey_audit_questions')
          .select('id')
          .eq('survey_id', surveyId)
          .then(res => res.data?.map(q => q.id) || [])
      )

    if (deleteError) {
      console.error('Error deleting existing responses:', deleteError)
    }

    // Insert new responses
    const responseInserts = []
    for (const [questionId, value] of Object.entries(responses)) {
      if (value !== null && value !== undefined && value !== '') {
        let responseData: any = {
          survey_audit_question_id: questionId,
          responded_by
        }

        // Determine response type and set appropriate field
        if (typeof value === 'string') {
          responseData.response_type = 'text'
          responseData.text_response = value
        } else if (typeof value === 'number') {
          responseData.response_type = 'number'
          responseData.number_response = value
        } else if (Array.isArray(value)) {
          responseData.response_type = 'array'
          responseData.array_response = value
        } else if (typeof value === 'object') {
          responseData.response_type = 'object'
          responseData.object_response = value
        }

        responseInserts.push(responseData)
      }
    }

    if (responseInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('survey_audit_responses')
        .insert(responseInserts)

      if (insertError) {
        console.error('Error inserting responses:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, count: responseInserts.length })
  } catch (error) {
    console.error('Error saving audit responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}