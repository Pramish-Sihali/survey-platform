
// app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'


export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params // AWAIT params
      const body = await request.json()
      const { name, description, is_active } = body
  
      const { data, error } = await supabase
        .from('departments')
        .update({
          name,
          description,
          is_active
        })
        .eq('id', id)
        .select()
        .single()
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
  
      return NextResponse.json({ department: data })
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
        .from('departments')
        .delete()
        .eq('id', id)
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
  
      return NextResponse.json({ message: 'Department deleted successfully' })
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }