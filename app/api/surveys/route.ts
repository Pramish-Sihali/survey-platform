// app/api/surveys/route.ts - Multi-Tenant Surveys API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Survey, SurveySection, Question, QuestionOption, UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface CreateSurveyRequest {
  title: string
  description?: string
  allows_refill?: boolean
  start_date?: string
  end_date?: string
  sections?: CreateSectionRequest[]
}

interface CreateSectionRequest {
  title: string
  description?: string
  order_index: number
  questions?: CreateQuestionRequest[]
}

interface CreateQuestionRequest {
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option?: boolean
  order_index: number
  metadata?: any
  options?: string[]
}

interface SurveyListResponse {
  surveys: Survey[]
  total: number
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  return {
    id: userId,
    role: userRole,
    company_id: companyId
  }
}

function canAccessSurveys(userRole: UserRole, userCompanyId: string, targetCompanyId?: string): boolean {
  // Super admin can access all surveys
  if (userRole === 'super_admin') return true
  
  // Company admin and users can access their company's surveys
  if (userCompanyId === targetCompanyId) return true
  
  return false
}

function canManageSurveys(userRole: UserRole, userCompanyId: string, targetCompanyId?: string): boolean {
  // Super admin can manage all surveys
  if (userRole === 'super_admin') return true
  
  // Company admin can manage their company's surveys
  if (userRole === 'company_admin' && userCompanyId === targetCompanyId) return true
  
  return false
}

async function getSurveysWithDetails(filters: {
  company_id?: string
  is_active?: boolean
  is_published?: boolean
  created_by?: string
} = {}): Promise<Survey[]> {
  try {
    let query = supabase
      .from('surveys')
      .select(`
        *,
        survey_sections!survey_sections_survey_id_fkey(
          id,
          title,
          description,
          order_index,
          questions!questions_section_id_fkey(
            id,
            question_text,
            question_type,
            is_required,
            has_other_option,
            order_index,
            metadata,
            question_options!question_options_question_id_fkey(
              id,
              option_text,
              order_index
            )
          )
        )
      `)

    // Apply filters
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching surveys:', error)
      return []
    }

    return (data || []).map(survey => ({
      ...survey,
      survey_sections: (survey.survey_sections || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(section => ({
          ...section,
          questions: (section.questions || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(question => ({
              ...question,
              question_options: (question.question_options || [])
                .sort((a, b) => a.order_index - b.order_index)
            }))
        }))
    })) as Survey[]
  } catch (error) {
    console.error('Error in getSurveysWithDetails:', error)
    return []
  }
}

function validateSurveyData(data: CreateSurveyRequest): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return 'Survey title is required'
  }

  if (data.title.trim().length < 3) {
    return 'Survey title must be at least 3 characters long'
  }

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    
    if (startDate >= endDate) {
      return 'End date must be after start date'
    }
  }

  // Validate sections if provided
  if (data.sections) {
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i]
      
      if (!section.title || section.title.trim().length === 0) {
        return `Section ${i + 1}: Title is required`
      }

      if (section.questions) {
        for (let j = 0; j < section.questions.length; j++) {
          const question = section.questions[j]
          
          if (!question.question_text || question.question_text.trim().length === 0) {
            return `Section ${i + 1}, Question ${j + 1}: Question text is required`
          }

          if (['radio', 'checkbox', 'select'].includes(question.question_type)) {
            if (!question.options || question.options.length === 0) {
              return `Section ${i + 1}, Question ${j + 1}: Options are required for ${question.question_type} questions`
            }
          }
        }
      }
    }
  }

  return null
}

// ============================================================================
// GET SURVEYS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const companyId = searchParams.get('company_id')
    const isActive = searchParams.get('is_active')
    const isPublished = searchParams.get('is_published')
    const createdBy = searchParams.get('created_by')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Apply access control
    let filters: any = {}

    if (authenticatedUser.role === 'super_admin') {
      // Super admin can see all surveys
      if (companyId) filters.company_id = companyId
    } else {
      // Company admin and users can only see their company's surveys
      filters.company_id = authenticatedUser.company_id
    }

    // Add other filters
    if (isActive !== null) filters.is_active = isActive === 'true'
    if (isPublished !== null) filters.is_published = isPublished === 'true'
    if (createdBy) filters.created_by = createdBy

    // For company users, only show published surveys
    if (authenticatedUser.role === 'company_user') {
      filters.is_published = true
      filters.is_active = true
    }

    // Fetch surveys
    const surveys = await getSurveysWithDetails(filters)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSurveys = surveys.slice(startIndex, endIndex)

    const response: SurveyListResponse = {
      surveys: paginatedSurveys,
      total: surveys.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE SURVEY
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body: CreateSurveyRequest = await request.json()

    // Only admins can create surveys
    if (authenticatedUser.role === 'company_user') {
      return NextResponse.json(
        { error: 'Insufficient permissions to create surveys' },
        { status: 403 }
      )
    }

    // Validate input
    const validationError = validateSurveyData(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Determine company_id
    let companyId = authenticatedUser.company_id
    if (authenticatedUser.role === 'super_admin' && body.company_id) {
      companyId = body.company_id
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check company survey limit
    if (authenticatedUser.role !== 'super_admin') {
      const { data: company } = await supabase
        .from('companies')
        .select('max_surveys')
        .eq('id', companyId)
        .single()

      if (company) {
        const { count: surveyCount } = await supabase
          .from('surveys')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId)
          .eq('is_active', true)

        if (surveyCount && surveyCount >= company.max_surveys) {
          return NextResponse.json(
            { error: `Company has reached maximum survey limit (${company.max_surveys})` },
            { status: 400 }
          )
        }
      }
    }

    // Create survey
    const surveyData = {
      company_id: companyId,
      created_by: authenticatedUser.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      is_active: true,
      is_published: false, // Start as draft
      allows_refill: body.allows_refill || false,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newSurvey, error: surveyError } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single()

    if (surveyError) {
      console.error('Error creating survey:', surveyError)
      return NextResponse.json(
        { error: 'Failed to create survey' },
        { status: 500 }
      )
    }

    // Create sections and questions if provided
    if (body.sections && body.sections.length > 0) {
      for (const sectionData of body.sections) {
        const { data: newSection, error: sectionError } = await supabase
          .from('survey_sections')
          .insert({
            survey_id: newSurvey.id,
            title: sectionData.title.trim(),
            description: sectionData.description?.trim() || null,
            order_index: sectionData.order_index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (sectionError) {
          console.error('Error creating section:', sectionError)
          continue
        }

        // Create questions for this section
        if (sectionData.questions && sectionData.questions.length > 0) {
          for (const questionData of sectionData.questions) {
            const { data: newQuestion, error: questionError } = await supabase
              .from('questions')
              .insert({
                section_id: newSection.id,
                question_text: questionData.question_text.trim(),
                question_type: questionData.question_type,
                is_required: questionData.is_required,
                has_other_option: questionData.has_other_option || false,
                order_index: questionData.order_index,
                metadata: questionData.metadata || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()

            if (questionError) {
              console.error('Error creating question:', questionError)
              continue
            }

            // Create question options if provided
            if (questionData.options && questionData.options.length > 0) {
              const optionsData = questionData.options.map((option, index) => ({
                question_id: newQuestion.id,
                option_text: option.trim(),
                order_index: index,
                created_at: new Date().toISOString()
              }))

              const { error: optionsError } = await supabase
                .from('question_options')
                .insert(optionsData)

              if (optionsError) {
                console.error('Error creating question options:', optionsError)
              }
            }
          }
        }
      }
    }

    // Fetch the created survey with all details
    const surveys = await getSurveysWithDetails({ company_id: companyId })
    const createdSurvey = surveys.find(survey => survey.id === newSurvey.id)

    if (!createdSurvey) {
      return NextResponse.json(
        { error: 'Survey created but failed to fetch survey data' },
        { status: 500 }
      )
    }

    console.log('Survey created successfully:', newSurvey.title, 'by:', authenticatedUser.id)

    return NextResponse.json({
      survey: createdSurvey
    }, { status: 201 })

  } catch (error) {
    console.error('Create survey error:', error)
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Surveys endpoint is active',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}