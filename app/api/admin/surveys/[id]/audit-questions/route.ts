// app/api/admin/surveys/[id]/audit-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    const { data: auditQuestions, error } = await supabase
      .from('survey_audit_questions')
      .select(`
        *,
        survey_audit_question_options (*)
      `)
      .eq('survey_id', surveyId)
      .order('order_index')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort options by order_index
    const questionsWithSortedOptions = auditQuestions?.map(question => ({
      ...question,
      survey_audit_question_options: question.survey_audit_question_options?.sort(
        (a: any, b: any) => a.order_index - b.order_index
      )
    }))

    return NextResponse.json({ auditQuestions: questionsWithSortedOptions })
  } catch (error) {
    console.log(error)
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
    const { 
      question_text, 
      question_type, 
      is_required, 
      has_other_option, 
      category, 
      description,
      options,
      created_by 
    } = body

    // Get the next order index
    const { data: existingQuestions } = await supabase
      .from('survey_audit_questions')
      .select('order_index')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingQuestions && existingQuestions.length > 0 
      ? existingQuestions[0].order_index + 1 
      : 0

    // Insert the audit question
    const { data: auditQuestion, error: questionError } = await supabase
      .from('survey_audit_questions')
      .insert({
        survey_id: surveyId,
        question_text,
        question_type,
        is_required: is_required ?? true,
        has_other_option: has_other_option ?? false,
        order_index: nextOrderIndex,
        category: category || 'General',
        description,
        created_by: created_by || 'admin'
      })
      .select()
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Insert options if provided
    if (options && options.length > 0) {
      const questionOptions = options.map((option: string, index: number) => ({
        survey_audit_question_id: auditQuestion.id,
        option_text: option,
        order_index: index
      }))

      const { error: optionsError } = await supabase
        .from('survey_audit_question_options')
        .insert(questionOptions)

      if (optionsError) {
        return NextResponse.json({ error: optionsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ auditQuestion }, { status: 201 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

