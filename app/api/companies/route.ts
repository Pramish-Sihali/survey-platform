// app/api/companies/route.ts - Companies API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, CompanyWithStats, UserRole } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface CreateCompanyRequest {
  name: string
  domain?: string
  subscription_plan: string
  max_users: number
  max_surveys: number
  is_active?: boolean
}

interface CompaniesResponse {
  companies: CompanyWithStats[]
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

function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin'
}

async function getCompaniesWithStats(): Promise<CompanyWithStats[]> {
  try {
    // Fetch companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return []
    }

    // Get stats for each company
    const companiesWithStats = await Promise.all(
      (companies || []).map(async (company) => {
        try {
          // Get user count
          const { count: userCount } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('company_id', company.id)
            .eq('is_active', true)

          // Get admin count
          const { count: adminCount } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('company_id', company.id)
            .eq('role', 'company_admin')
            .eq('is_active', true)

          // Get survey count
          const { count: surveyCount } = await supabase
            .from('surveys')
            .select('id', { count: 'exact' })
            .eq('company_id', company.id)
            .eq('is_active', true)

          // Get active assignments count
          const { count: activeAssignments } = await supabase
            .from('survey_assignments')
            .select('id', { count: 'exact' })
            .eq('status', 'pending')
            .in('survey_id', [
              // Subquery to get survey IDs for this company
            ])

          return {
            ...company,
            user_count: userCount || 0,
            admin_count: adminCount || 0,
            survey_count: surveyCount || 0,
            active_assignments: activeAssignments || 0
          } as CompanyWithStats
        } catch (error) {
          console.error(`Error fetching stats for company ${company.id}:`, error)
          return {
            ...company,
            user_count: 0,
            admin_count: 0,
            survey_count: 0,
            active_assignments: 0
          } as CompanyWithStats
        }
      })
    )

    return companiesWithStats
  } catch (error) {
    console.error('Error in getCompaniesWithStats:', error)
    return []
  }
}

function validateCompanyData(data: CreateCompanyRequest): string | null {
  if (!data.name || data.name.trim().length === 0) {
    return 'Company name is required'
  }

  if (data.name.trim().length < 2) {
    return 'Company name must be at least 2 characters long'
  }

  if (!data.subscription_plan || data.subscription_plan.trim().length === 0) {
    return 'Subscription plan is required'
  }

  if (!data.max_users || data.max_users < 1) {
    return 'Max users must be at least 1'
  }

  if (!data.max_surveys || data.max_surveys < 1) {
    return 'Max surveys must be at least 1'
  }

  if (data.domain && data.domain.trim().length > 0) {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    if (!domainRegex.test(data.domain.trim())) {
      return 'Invalid domain format'
    }
  }

  return null
}

// ============================================================================
// GET COMPANIES
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)

    // Only super admins can view companies
    if (!isSuperAdmin(authenticatedUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const isActive = searchParams.get('is_active')

    // Fetch companies with stats
    let companies = await getCompaniesWithStats()

    // Apply filters
    if (isActive !== null) {
      const activeFilter = isActive === 'true'
      companies = companies.filter(company => company.is_active === activeFilter)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCompanies = companies.slice(startIndex, endIndex)

    const response: CompaniesResponse = {
      companies: paginatedCompanies,
      total: companies.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get companies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// ============================================================================
// CREATE COMPANY
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)

    // Only super admins can create companies
    if (!isSuperAdmin(authenticatedUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const body: CreateCompanyRequest = await request.json()

    // Validate input
    const validationError = validateCompanyData(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Check if company name already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', body.name.trim())
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    // Check if domain already exists (if provided)
    if (body.domain && body.domain.trim().length > 0) {
      const { data: existingDomain } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', body.domain.trim().toLowerCase())
        .single()

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Company with this domain already exists' },
          { status: 409 }
        )
      }
    }

    // Create company
    const companyData = {
      name: body.name.trim(),
      domain: body.domain?.trim().toLowerCase() || null,
      subscription_plan: body.subscription_plan.trim(),
      max_users: body.max_users,
      max_surveys: body.max_surveys,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating company:', createError)
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    // Add stats to the new company
    const companyWithStats: CompanyWithStats = {
      ...newCompany,
      user_count: 0,
      admin_count: 0,
      survey_count: 0,
      active_assignments: 0
    }

    console.log('Company created successfully:', newCompany.name, 'by:', authenticatedUser.id)

    return NextResponse.json({
      company: companyWithStats
    }, { status: 201 })

  } catch (error) {
    console.error('Create company error:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Companies endpoint is active',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}