// app/api/admin/audit-questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      question_text, 
      question_type, 
      is_required, 
      has_other_option, 
      category, 
      description, 
      options 
    } = body

    // Update the audit question
    const { data: auditQuestion, error: questionError } = await supabase
      .from('survey_audit_questions')
      .update({
        question_text,
        question_type,
        is_required,
        has_other_option,
        category,
        description
      })
      .eq('id', id)
      .select()
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Update options if provided
    if (options !== undefined) {
      // Delete existing options
      await supabase
        .from('survey_audit_question_options')
        .delete()
        .eq('survey_audit_question_id', id)

      // Insert new options
      if (options.length > 0) {
        const questionOptions = options.map((option: string, index: number) => ({
          survey_audit_question_id: id,
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
    }

    return NextResponse.json({ auditQuestion })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('survey_audit_questions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Audit question deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
