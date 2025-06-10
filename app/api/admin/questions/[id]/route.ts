
// app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// app/api/questions/[id]/route.ts - FIXED
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params // AWAIT params
      const body = await request.json()
      const { question_text, question_type, is_required, has_other_option, order_index, options } = body
  
      // Update the question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .update({
          question_text,
          question_type,
          is_required,
          has_other_option,
          order_index
        })
        .eq('id', id)
        .select()
        .single()
  
      if (questionError) {
        return NextResponse.json({ error: questionError.message }, { status: 500 })
      }
  
      // Update options if provided
      if (options) {
        // Delete existing options
        await supabase
          .from('question_options')
          .delete()
          .eq('question_id', id)
  
        // Insert new options
        if (options.length > 0) {
          const questionOptions = options.map((option: string, index: number) => ({
            question_id: id,
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
      }
  
      return NextResponse.json({ question })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params // AWAIT params
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
  
      return NextResponse.json({ message: 'Question deleted successfully' })
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  