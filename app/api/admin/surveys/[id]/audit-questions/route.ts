// app/api/admin/surveys/[id]/audit-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    // Fetch audit questions with their sections and options
    const { data: auditQuestions, error } = await supabase
      .from('survey_audit_questions')
      .select(`
        *,
        survey_sections (
          id,
          title,
          description,
          order_index
        ),
        survey_audit_question_options (
          option_text,
          order_index
        )
      `)
      .eq('survey_id', surveyId)
      .order('created_at')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Raw audit questions:', auditQuestions)

    // Group questions by section
    const auditQuestionsBySection: Record<string, any> = {}
    
    auditQuestions?.forEach(question => {
      const sectionId = question.section_id || 'no_section'
      const section = question.survey_sections
      
      if (!auditQuestionsBySection[sectionId]) {
        auditQuestionsBySection[sectionId] = {
          section: section || {
            id: 'no_section',
            title: 'Unassigned Questions',
            description: 'Questions not assigned to any section',
            order_index: 999
          },
          questions: []
        }
      }
      
      auditQuestionsBySection[sectionId].questions.push(question)
    })

    console.log('Grouped audit questions:', auditQuestionsBySection)

    return NextResponse.json({
      auditQuestionsBySection,
      totalQuestions: auditQuestions?.length || 0
    })
  } catch (error) {
    console.error('Error fetching audit questions:', error)
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
      section_id,
      question_text,
      question_type,
      is_required,
      has_other_option,
      description,
      options,
      created_by
    } = body

    // Insert the audit question
    const { data: question, error: questionError } = await supabase
      .from('survey_audit_questions')
      .insert({
        survey_id: surveyId,
        section_id,
        question_text,
        question_type,
        is_required: is_required || false,
        has_other_option: has_other_option || false,
        description,
        category: 'audit',
        created_by
      })
      .select()
      .single()

    if (questionError) {
      console.error('Error creating question:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Insert options if provided
    if (options && options.length > 0) {
      const optionInserts = options.map((optionText: string, index: number) => ({
        survey_audit_question_id: question.id,
        option_text: optionText,
        order_index: index
      }))

      const { error: optionsError } = await supabase
        .from('survey_audit_question_options')
        .insert(optionInserts)

      if (optionsError) {
        console.error('Error creating options:', optionsError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating audit question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}