// app/api/departments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')
  
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
      const { name, description } = body
  
      const { data, error } = await supabase
        .from('departments')
        .insert({ name, description })
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
  
  