// app/api/admin/surveys/[id]/audit-responses/route.ts - DEFENSIVE VERSION
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    console.log('Fetching audit responses for survey:', surveyId)

    // Try to fetch audit responses with a more defensive approach
    // First, try direct query without complex joins
    const { data: auditResponses, error } = await supabase
      .from('survey_audit_responses')
      .select('*')
      .eq('survey_id', surveyId)

    if (error) {
      console.error('Supabase error fetching audit responses:', error)
      
      // If even the basic query fails, return empty array with debug info
      return NextResponse.json({
        auditResponses: [],
        debug: {
          surveyId,
          error: error.message,
          queryType: 'direct'
        }
      })
    }

    console.log('Successfully fetched audit responses:', auditResponses?.length || 0)

    return NextResponse.json({
      auditResponses: auditResponses || [],
      debug: {
        surveyId,
        responseCount: auditResponses?.length || 0,
        queryType: 'direct',
        sampleResponse: auditResponses?.[0] || null
      }
    })
  } catch (error) {
    console.error('Error fetching audit responses:', error)
    return NextResponse.json({ 
      auditResponses: [],
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
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

    console.log('Saving audit responses for survey:', surveyId)
    console.log('Response count:', Object.keys(responses || {}).length)

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0,
        message: 'No responses to save'
      })
    }

    // First, try to delete existing responses for this survey
    try {
      const { error: deleteError } = await supabase
        .from('survey_audit_responses')
        .delete()
        .eq('survey_id', surveyId)

      if (deleteError) {
        console.warn('Error deleting existing responses (continuing anyway):', deleteError)
      }
    } catch (deleteError) {
      console.warn('Error in delete operation (continuing anyway):', deleteError)
    }

    // Insert new responses
    const responseInserts = []
    for (const [questionId, value] of Object.entries(responses)) {
      if (value !== null && value !== undefined && value !== '') {
        let responseData: any = {
          survey_id: surveyId,
          survey_audit_question_id: questionId,
          responded_by: responded_by || 'admin'
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

    console.log('Preparing to insert responses:', responseInserts.length)

    if (responseInserts.length > 0) {
      const { data: insertedResponses, error: insertError } = await supabase
        .from('survey_audit_responses')
        .insert(responseInserts)
        .select()

      if (insertError) {
        console.error('Error inserting responses:', insertError)
        return NextResponse.json({ 
          error: insertError.message,
          debug: {
            surveyId,
            insertCount: responseInserts.length,
            sampleInsert: responseInserts[0]
          }
        }, { status: 500 })
      }

      console.log('Successfully inserted responses:', insertedResponses?.length || responseInserts.length)
    }

    return NextResponse.json({ 
      success: true, 
      count: responseInserts.length,
      debug: {
        surveyId,
        processedResponses: Object.keys(responses).length,
        insertedResponses: responseInserts.length,
        respondedBy: responded_by
      }
    })
  } catch (error) {
    console.error('Error saving audit responses:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      debug: {
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}