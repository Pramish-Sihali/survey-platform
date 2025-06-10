// app/api/admin/surveys/[id]/survey-sections/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    // Fetch survey sections
    const { data: sections, error } = await supabase
      .from('survey_sections')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      sections: sections || []
    })
  } catch (error) {
    console.error('Error fetching survey sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}