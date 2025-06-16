// app/api/super-admin/analytics/route.ts - Platform Analytics API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

interface PlatformAnalytics {
  overview: {
    totalCompanies: number
    activeCompanies: number
    totalUsers: number
    activeUsers: number
    totalSurveys: number
    activeSurveys: number
    totalResponses: number
    averageResponseRate: number
  }
  companyBreakdown: Array<{
    id: string
    name: string
    subscription_plan: string
    user_count: number
    survey_count: number
    response_count: number
    is_active: boolean
    created_at: string
  }>
  userRoleDistribution: {
    super_admin: number
    company_admin: number
    company_user: number
  }
  subscriptionAnalytics: {
    basic: number
    professional: number
    premium: number
    enterprise: number
  }
  activityMetrics: {
    newCompaniesThisMonth: number
    newUsersThisMonth: number
    surveysCreatedThisMonth: number
    responsesThisMonth: number
  }
  trendsData: {
    companiesGrowth: Array<{ month: string; count: number }>
    usersGrowth: Array<{ month: string; count: number }>
    surveysGrowth: Array<{ month: string; count: number }>
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  // TEMPORARY: For testing when headers are not set
  if (!userId || !userRole) {
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

async function calculatePlatformAnalytics(timeframe: string = '30d'): Promise<PlatformAnalytics> {
  try {
    // Calculate date ranges
    const currentDate = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all basic data
    const [companiesResponse, usersResponse, surveysResponse, responsesResponse] = await Promise.all([
      supabase.from('companies').select('*'),
      supabase.from('users').select('*'),
      supabase.from('surveys').select('*'),
      supabase.from('survey_responses').select('*')
    ])

    const companies = companiesResponse.data || []
    const users = usersResponse.data || []
    const surveys = surveysResponse.data || []
    const responses = responsesResponse.data || []

    // Calculate overview metrics
    const overview = {
      totalCompanies: companies.length,
      activeCompanies: companies.filter(c => c.is_active).length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      totalSurveys: surveys.length,
      activeSurveys: surveys.filter(s => s.is_active && s.is_published).length,
      totalResponses: responses.length,
      averageResponseRate: surveys.length > 0 ? Math.round((responses.length / surveys.length) * 100) : 0
    }

    // Calculate company breakdown with stats
    const companyBreakdown = companies.map(company => {
      const companyUsers = users.filter(u => u.company_id === company.id)
      const companySurveys = surveys.filter(s => s.company_id === company.id)
      const companyResponses = responses.filter(r => 
        companySurveys.some(s => s.id === r.survey_id)
      )

      return {
        id: company.id,
        name: company.name,
        subscription_plan: company.subscription_plan,
        user_count: companyUsers.length,
        survey_count: companySurveys.length,
        response_count: companyResponses.length,
        is_active: company.is_active,
        created_at: company.created_at
      }
    })

    // Calculate user role distribution
    const userRoleDistribution = {
      super_admin: users.filter(u => u.role === 'super_admin').length,
      company_admin: users.filter(u => u.role === 'company_admin').length,
      company_user: users.filter(u => u.role === 'company_user').length
    }

    // Calculate subscription analytics
    const subscriptionAnalytics = {
      basic: companies.filter(c => c.subscription_plan === 'basic').length,
      professional: companies.filter(c => c.subscription_plan === 'professional').length,
      premium: companies.filter(c => c.subscription_plan === 'premium').length,
      enterprise: companies.filter(c => c.subscription_plan === 'enterprise').length
    }

    // Calculate activity metrics (last 30 days)
    const activityMetrics = {
      newCompaniesThisMonth: companies.filter(c => new Date(c.created_at) >= oneMonthAgo).length,
      newUsersThisMonth: users.filter(u => new Date(u.created_at) >= oneMonthAgo).length,
      surveysCreatedThisMonth: surveys.filter(s => new Date(s.created_at) >= oneMonthAgo).length,
      responsesThisMonth: responses.filter(r => new Date(r.submitted_at) >= oneMonthAgo).length
    }

    // Calculate trends data (last 12 months)
    const trendsData = {
      companiesGrowth: calculateMonthlyGrowth(companies, 'created_at'),
      usersGrowth: calculateMonthlyGrowth(users, 'created_at'),
      surveysGrowth: calculateMonthlyGrowth(surveys, 'created_at')
    }

    return {
      overview,
      companyBreakdown,
      userRoleDistribution,
      subscriptionAnalytics,
      activityMetrics,
      trendsData
    }

  } catch (error) {
    console.error('Error calculating platform analytics:', error)
    
    // Return empty analytics structure on error
    return {
      overview: {
        totalCompanies: 0,
        activeCompanies: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalSurveys: 0,
        activeSurveys: 0,
        totalResponses: 0,
        averageResponseRate: 0
      },
      companyBreakdown: [],
      userRoleDistribution: {
        super_admin: 0,
        company_admin: 0,
        company_user: 0
      },
      subscriptionAnalytics: {
        basic: 0,
        professional: 0,
        premium: 0,
        enterprise: 0
      },
      activityMetrics: {
        newCompaniesThisMonth: 0,
        newUsersThisMonth: 0,
        surveysCreatedThisMonth: 0,
        responsesThisMonth: 0
      },
      trendsData: {
        companiesGrowth: [],
        usersGrowth: [],
        surveysGrowth: []
      }
    }
  }
}

function calculateMonthlyGrowth(data: any[], dateField: string): Array<{ month: string; count: number }> {
  const now = new Date()
  const months = []
  
  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    
    const monthData = data.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= date && itemDate < nextMonth
    })
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: monthData.length
    })
  }
  
  return months
}

// ============================================================================
// GET ANALYTICS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Only super admins can access platform analytics
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const timeframe = searchParams.get('timeframe') || '30d'
    const includeDetails = searchParams.get('details') === 'true'

    // Calculate analytics
    const analytics = await calculatePlatformAnalytics(timeframe)

    // Add metadata
    const response = {
      ...analytics,
      metadata: {
        timeframe,
        generated_at: new Date().toISOString(),
        generated_by: authenticatedUser.id
      }
    }

    // If details not requested, remove some heavy data
    // if (!includeDetails) {
    //   delete response.trendsData
    //   response.companyBreakdown = response.companyBreakdown.slice(0, 10) // Top 10 only
    // }

    // return NextResponse.json(response)

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform analytics' },
      { status: 500 }
    )
  }
}

// ============================================================================
// REAL-TIME METRICS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body = await request.json()

    // Only super admins can access real-time metrics
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const { metrics } = body

    // Calculate specific metrics requested
    const results: any = {}

    if (metrics.includes('active_users')) {
      // Users active in last 24 hours (based on last_login)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gte('last_login', yesterday)
        .eq('is_active', true)

      results.active_users_24h = count || 0
    }

    if (metrics.includes('recent_signups')) {
      // New users in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('users')
        .select('name, email, created_at, companies(name)')
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false })
        .limit(10)

      results.recent_signups = data || []
    }

    if (metrics.includes('survey_activity')) {
      // Survey responses in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('survey_responses')
        .select('id', { count: 'exact' })
        .gte('submitted_at', yesterday)

      results.survey_responses_24h = count || 0
    }

    if (metrics.includes('system_health')) {
      // Basic system health metrics
      const [companiesHealth, usersHealth, surveysHealth] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('surveys').select('id', { count: 'exact' })
      ])

      results.system_health = {
        database: 'healthy',
        total_records: (companiesHealth.count || 0) + (usersHealth.count || 0) + (surveysHealth.count || 0),
        last_checked: new Date().toISOString()
      }
    }

    return NextResponse.json({
      metrics: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Real-time metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Super Admin Analytics endpoint is active',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
  })
}