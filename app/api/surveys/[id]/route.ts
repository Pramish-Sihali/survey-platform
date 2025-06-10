// app/api/surveys/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // AWAIT params
    
    const { data: survey, error } = await supabase
      .from('surveys')
      .select(`
        *,
        survey_sections (
          *,
          questions (
            *,
            question_options (*)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Sort sections and questions by order_index
    survey.survey_sections = survey.survey_sections
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .map((section: any) => ({
        ...section,
        questions: section.questions
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((question: any) => ({
            ...question,
            question_options: question.question_options?.sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      }))

    return NextResponse.json({ survey })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // AWAIT params
    const body = await request.json()
    const { title, description, is_active, is_published, start_date, end_date } = body

    const { data, error } = await supabase
      .from('surveys')
      .update({
        title,
        description,
        is_active,
        is_published,
        start_date,
        end_date
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ survey: data })
  } catch (error) {
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
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Survey deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
