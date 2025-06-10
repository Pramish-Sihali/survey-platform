// app/api/departments/route.ts - CONSOLIDATED
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminView = searchParams.get('admin') === 'true'
    
    // For admin view, get all departments (including inactive)
    // For public view, get only active departments
    const query = supabase
      .from('departments')
      .select('*')
      .order('name')
    
    if (!adminView) {
      query.eq('is_active', true)
    }

    const { data: departments, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ departments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, is_active = true } = body

    const { data, error } = await supabase
      .from('departments')
      .insert({ name, description, is_active })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ department: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}