// app/api/admin/surveys/[id]/audit-questions/route.ts - DEFENSIVE FIX
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    console.log('Fetching audit questions for survey:', surveyId)

    // First, try the ideal query with proper joins
    let auditQuestions: any[] = []
    let sections: any[] = []
    
    try {
      // Attempt to fetch with proper relationship
      const { data: questionsWithSections, error: relationshipError } = await supabase
        .from('survey_audit_questions')
        .select(`
          *,
          survey_sections (
            id,
            title,
            description,
            order_index
          ),
          survey_audit_question_options (
            option_text,
            order_index
          )
        `)
        .eq('survey_id', surveyId)
        .order('created_at')

      if (!relationshipError && questionsWithSections) {
        console.log('Successfully fetched with relationships')
        auditQuestions = questionsWithSections
      } else {
        throw new Error('Relationship query failed')
      }
    } catch (relationshipError) {
      console.log('Relationship query failed, falling back to separate queries')
      
      // Fallback: Fetch questions and sections separately
      const [questionsResult, sectionsResult] = await Promise.all([
        supabase
          .from('survey_audit_questions')
          .select(`
            *,
            survey_audit_question_options (
              option_text,
              order_index
            )
          `)
          .eq('survey_id', surveyId)
          .order('created_at'),
        supabase
          .from('survey_sections')
          .select('*')
          .eq('survey_id', surveyId)
          .order('order_index')
      ])

      if (questionsResult.error) {
        console.error('Questions query error:', questionsResult.error)
        return NextResponse.json({ error: questionsResult.error.message }, { status: 500 })
      }

      if (sectionsResult.error) {
        console.error('Sections query error:', sectionsResult.error)
        return NextResponse.json({ error: sectionsResult.error.message }, { status: 500 })
      }

      auditQuestions = questionsResult.data || []
      sections = sectionsResult.data || []
      
      // Manually join the data
      auditQuestions = auditQuestions.map(question => {
        // Try to find matching section by section_id
        let matchingSection = null
        if (question.section_id) {
          // Handle both string and UUID section_id
          matchingSection = sections.find(section => 
            section.id === question.section_id || 
            section.id.toString() === question.section_id.toString()
          )
        }
        
        return {
          ...question,
          survey_sections: matchingSection
        }
      })
    }

    console.log('Final audit questions:', auditQuestions?.length || 0)

    // Group questions by section for the frontend
    const auditQuestionsBySection: Record<string, any> = {}
    
    // First, add all available sections (even if they have no questions)
    if (sections.length > 0) {
      sections.forEach(section => {
        auditQuestionsBySection[section.id] = {
          section,
          questions: []
        }
      })
    }
    
    // Then, group questions by section
    auditQuestions?.forEach(question => {
      const section = question.survey_sections
      const sectionId = section?.id || 'no_section'
      
      if (!auditQuestionsBySection[sectionId]) {
        auditQuestionsBySection[sectionId] = {
          section: section || {
            id: 'no_section',
            title: 'Unassigned Questions',
            description: 'Questions not assigned to any section',
            order_index: 999
          },
          questions: []
        }
      }
      
      auditQuestionsBySection[sectionId].questions.push(question)
    })

    console.log('Grouped by section:', Object.keys(auditQuestionsBySection))

    return NextResponse.json({
      auditQuestionsBySection,
      totalQuestions: auditQuestions?.length || 0,
      totalSections: Object.keys(auditQuestionsBySection).length,
      debug: {
        surveyId,
        questionsCount: auditQuestions?.length || 0,
        sectionsCount: sections.length,
        hasRelationshipData: auditQuestions.some(q => q.survey_sections),
        sampleQuestion: auditQuestions[0] || null
      }
    })
  } catch (error) {
    console.error('Error fetching audit questions:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params
    const body = await request.json()
    
    const {
      section_id,
      question_text,
      question_type,
      is_required,
      has_other_option,
      description,
      options,
      created_by,
      category
    } = body

    console.log('Creating audit question:', { surveyId, section_id, question_text })

    // Insert the audit question
    const { data: question, error: questionError } = await supabase
      .from('survey_audit_questions')
      .insert({
        survey_id: surveyId,
        section_id: section_id || null, // Handle optional section_id
        question_text,
        question_type,
        is_required: is_required || false,
        has_other_option: has_other_option || false,
        description,
        category: category || 'General',
        created_by: created_by || 'admin',
        order_index: 0 // Let the database handle ordering
      })
      .select()
      .single()

    if (questionError) {
      console.error('Error creating question:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Insert options if provided
    if (options && options.length > 0) {
      const optionInserts = options.map((optionText: string, index: number) => ({
        survey_audit_question_id: question.id,
        option_text: optionText,
        order_index: index
      }))

      const { error: optionsError } = await supabase
        .from('survey_audit_question_options')
        .insert(optionInserts)

      if (optionsError) {
        console.error('Error creating options:', optionsError)
        // Don't fail the request, just log the error
      }
    }

    console.log('Successfully created audit question:', question.id)

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating audit question:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}