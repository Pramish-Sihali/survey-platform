// app/api/surveys/route.ts - FIXED TO SHOW ALL ACTIVE SURVEYS
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all active surveys (removed is_published filter)
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Found surveys:', surveys?.length || 0)

    // Filter surveys by date range (only if dates are set)
    const now = new Date()
    const activeSurveys = surveys?.filter(survey => {
      // If no dates are set, include the survey
      if (!survey.start_date && !survey.end_date) return true
      
      // If only start date is set
      if (survey.start_date && !survey.end_date) {
        return now >= new Date(survey.start_date)
      }
      
      // If only end date is set
      if (!survey.start_date && survey.end_date) {
        return now <= new Date(survey.end_date)
      }
      
      // If both dates are set
      if (survey.start_date && survey.end_date) {
        const startDate = new Date(survey.start_date)
        const endDate = new Date(survey.end_date)
        return now >= startDate && now <= endDate
      }
      
      return true
    }) || []

    console.log('Active surveys after date filter:', activeSurveys.length)

    return NextResponse.json({ surveys: activeSurveys })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, is_active, start_date, end_date } = body

    const { data, error } = await supabase
      .from('surveys')
      .insert({
        title,
        description,
        is_active: is_active ?? true,
        is_published: true, // Always set to true, we'll only use is_active
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