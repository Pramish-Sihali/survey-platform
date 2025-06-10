// app/api/surveys/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter surveys by date range
    const now = new Date()
    const activeSurveys = surveys?.filter(survey => {
      if (!survey.start_date || !survey.end_date) return true
      const startDate = new Date(survey.start_date)
      const endDate = new Date(survey.end_date)
      return now >= startDate && now <= endDate
    })

    return NextResponse.json({ surveys: activeSurveys })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, is_active, is_published, start_date, end_date } = body

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        title,
        description,
        is_active: is_active ?? true,
        is_published: is_published ?? false,
        start_date,
        end_date
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ survey: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
