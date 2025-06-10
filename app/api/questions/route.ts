// app/api/questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section_id, question_text, question_type, is_required, has_other_option, order_index, options } = body

    // Insert the question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        section_id,
        question_text,
        question_type,
        is_required: is_required ?? true,
        has_other_option: has_other_option ?? false,
        order_index
      })
      .select()
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Insert options if provided
    if (options && options.length > 0) {
      const questionOptions = options.map((option: string, index: number) => ({
        question_id: question.id,
        option_text: option,
        order_index: index
      }))

      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(questionOptions)

      if (optionsError) {
        return NextResponse.json({ error: optionsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
