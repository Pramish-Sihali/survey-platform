// app/api/companies/route.ts - Companies API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, CompanyWithStats, CompaniesResponse, UserRole } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

interface CreateCompanyRequest {
  name: string
  domain?: string
  subscription_plan: 'basic' | 'professional' | 'premium' | 'enterprise'
  max_users: number
  max_surveys: number
  is_active: boolean
}

// Type for the assignment query result
interface AssignmentWithSurvey {
  survey_id: string
  status: string
  surveys: {
    company_id: string
  }[] | null
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  console.log('Companies API - Auth headers received:', {
    userId,
    userRole,
    companyId
  })

  // TEMPORARY: For testing when headers are not set or invalid
  if (!userId || !userRole || !['super_admin', 'company_admin', 'company_user'].includes(userRole)) {
    console.log('Companies API - No valid auth headers found, using test super admin')
    return { 
      id: 'test-super-admin', 
      role: 'super_admin' as UserRole, 
      company_id: null 
    }
  }

  return {
    id: userId,
    role: userRole,
    company_id: companyId
  }
}

async function getCompaniesWithStats(): Promise<CompanyWithStats[]> {
  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return []
    }

    if (!companies || companies.length === 0) {
      return []
    }

    // Get user counts for each company
    const { data: userCounts, error: userCountsError } = await supabase
      .from('users')
      .select('company_id')
      .not('company_id', 'is', null)

    if (userCountsError) {
      console.error('Error fetching user counts:', userCountsError)
    }

    // Get survey counts for each company
    const { data: surveyCounts, error: surveyCountsError } = await supabase
      .from('surveys')
      .select('company_id')

    if (surveyCountsError) {
      console.error('Error fetching survey counts:', surveyCountsError)
    }

    // Get assignment counts for each company
    const { data: assignmentCounts, error: assignmentCountsError } = await supabase
      .from('survey_assignments')
      .select(`
        survey_id,
        surveys(company_id),
        status
      `)
      .in('status', ['pending', 'in_progress'])

    if (assignmentCountsError) {
      console.error('Error fetching assignment counts:', assignmentCountsError)
    }

    // Count statistics for each company
    const userCountMap = new Map<string, number>()
    const adminCountMap = new Map<string, number>()
    
    if (userCounts) {
      for (const userRecord of userCounts) {
        if (userRecord.company_id) {
          userCountMap.set(userRecord.company_id, (userCountMap.get(userRecord.company_id) || 0) + 1)
        }
      }
    }

    // Get admin counts separately
    const { data: adminCounts, error: adminCountsError } = await supabase
      .from('users')
      .select('company_id')
      .eq('role', 'company_admin')
      .not('company_id', 'is', null)

    if (!adminCountsError && adminCounts) {
      for (const adminRecord of adminCounts) {
        if (adminRecord.company_id) {
          adminCountMap.set(adminRecord.company_id, (adminCountMap.get(adminRecord.company_id) || 0) + 1)
        }
      }
    }

    const surveyCountMap = new Map<string, number>()
    if (surveyCounts) {
      for (const surveyRecord of surveyCounts) {
        surveyCountMap.set(surveyRecord.company_id, (surveyCountMap.get(surveyRecord.company_id) || 0) + 1)
      }
    }

    const assignmentCountMap = new Map<string, number>()
    if (assignmentCounts) {
      // Type assertion to help TypeScript understand the structure
      const typedAssignmentCounts = assignmentCounts as AssignmentWithSurvey[]
      for (const assignmentRecord of typedAssignmentCounts) {
        // Handle surveys as array (Supabase returns it as array even for single joins)
        const companyId = assignmentRecord.surveys?.[0]?.company_id
        if (companyId) {
          assignmentCountMap.set(companyId, (assignmentCountMap.get(companyId) || 0) + 1)
        }
      }
    }

    // Combine data
    const companiesWithStats: CompanyWithStats[] = companies.map(company => ({
      ...company,
      user_count: userCountMap.get(company.id) || 0,
      admin_count: adminCountMap.get(company.id) || 0,
      survey_count: surveyCountMap.get(company.id) || 0,
      active_assignments: assignmentCountMap.get(company.id) || 0
    }))

    return companiesWithStats

  } catch (error) {
    console.error('Error in getCompaniesWithStats:', error)
    return []
  }
}

// ============================================================================
// GET COMPANIES
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Only super admins can list all companies
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch companies with stats
    let companies = await getCompaniesWithStats()

    // Apply filters
    if (isActive !== null) {
      companies = companies.filter(company => 
        company.is_active === (isActive === 'true')
      )
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
    const body: CreateCompanyRequest = await request.json()

    // Only super admins can create companies
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const { name, domain, subscription_plan, max_users, max_surveys, is_active } = body

    // Validate required fields
    if (!name || !subscription_plan || !max_users || !max_surveys) {
      return NextResponse.json(
        { error: 'Name, subscription_plan, max_users, and max_surveys are required' },
        { status: 400 }
      )
    }

    // Validate subscription plan
    const validPlans = ['basic', 'professional', 'premium', 'enterprise']
    if (!validPlans.includes(subscription_plan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan. Must be: basic, professional, premium, or enterprise' },
        { status: 400 }
      )
    }

    // Validate limits
    if (max_users < 1 || max_surveys < 1) {
      return NextResponse.json(
        { error: 'Max users and max surveys must be at least 1' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Company name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Check if company name already exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      )
    }

    // Check if domain already exists (if provided)
    if (domain && domain.trim()) {
      const { data: existingDomain } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', domain.trim().toLowerCase())
        .single()

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Company with this domain already exists' },
          { status: 409 }
        )
      }

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
      if (!domainRegex.test(domain.trim())) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        )
      }
    }

    // Create company
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: name.trim(),
        domain: domain ? domain.trim().toLowerCase() : null,
        subscription_plan,
        max_users,
        max_surveys,
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (companyError) {
      console.error('Error creating company:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    // Fetch the created company with stats
    const companies = await getCompaniesWithStats()
    const createdCompany = companies.find(company => company.id === newCompany.id)

    if (!createdCompany) {
      return NextResponse.json(
        { error: 'Company created but failed to fetch company data' },
        { status: 500 }
      )
    }

    console.log('Company created successfully:', name, 'by:', authenticatedUser.id)

    return NextResponse.json({
      company: createdCompany
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