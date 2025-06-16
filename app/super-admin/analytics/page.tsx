'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile } from '@/lib/types'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { 
  Building2, 
  Users, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Crown,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

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
}

export default function SuperAdminAnalyticsPage() {
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeframe])

  const loadAnalytics = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)

      // Simulate fetching platform analytics
      // In a real implementation, you'd have dedicated analytics endpoints
      const [companiesResponse, usersResponse, surveysResponse] = await Promise.all([
        ApiClient.getCompanies(),
        ApiClient.getUsers(),
        ApiClient.getSurveys()
      ])

      const companies = companiesResponse.companies
      const users = usersResponse.users
      const surveys = surveysResponse.surveys

      // Calculate analytics
      const currentDate = new Date()
      const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      const platformAnalytics: PlatformAnalytics = {
        overview: {
          totalCompanies: companies.length,
          activeCompanies: companies.filter(c => c.is_active).length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.is_active).length,
          totalSurveys: surveys.length,
          activeSurveys: surveys.filter(s => s.is_active && s.is_published).length,
          totalResponses: 0, // Would need survey responses data
          averageResponseRate: 0 // Would need survey responses data
        },
        companyBreakdown: companies.map(company => ({
          id: company.id,
          name: company.name,
          subscription_plan: company.subscription_plan,
          user_count: users.filter(u => u.company_id === company.id).length,
          survey_count: surveys.filter(s => s.company_id === company.id).length,
          response_count: 0, // Would need survey responses data
          is_active: company.is_active,
          created_at: company.created_at
        })),
        userRoleDistribution: {
          super_admin: users.filter(u => u.role === 'super_admin').length,
          company_admin: users.filter(u => u.role === 'company_admin').length,
          company_user: users.filter(u => u.role === 'company_user').length
        },
        subscriptionAnalytics: {
          basic: companies.filter(c => c.subscription_plan === 'basic').length,
          professional: companies.filter(c => c.subscription_plan === 'professional').length,
          premium: companies.filter(c => c.subscription_plan === 'premium').length,
          enterprise: companies.filter(c => c.subscription_plan === 'enterprise').length
        },
        activityMetrics: {
          newCompaniesThisMonth: companies.filter(c => new Date(c.created_at) >= oneMonthAgo).length,
          newUsersThisMonth: users.filter(u => new Date(u.created_at) >= oneMonthAgo).length,
          surveysCreatedThisMonth: surveys.filter(s => new Date(s.created_at) >= oneMonthAgo).length,
          responsesThisMonth: 0 // Would need survey responses data
        }
      }

      setAnalytics(platformAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      case 'professional':
        return 'bg-blue-100 text-blue-800'
      case 'premium':
        return 'bg-purple-100 text-purple-800'
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user || !analytics) {
    return <div>Error loading analytics</div>
  }

  return (
    <SuperAdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-2">Business insights and performance metrics</p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCompanies}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {analytics.overview.activeCompanies} active ({formatPercentage(analytics.overview.activeCompanies, analytics.overview.totalCompanies)})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  {analytics.overview.activeUsers} active ({formatPercentage(analytics.overview.activeUsers, analytics.overview.totalUsers)})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Surveys</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSurveys}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {analytics.overview.activeSurveys} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activityMetrics.newCompaniesThisMonth}</p>
                <p className="text-xs text-orange-600 mt-1">New companies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.activityMetrics.newCompaniesThisMonth}</p>
              <p className="text-sm text-gray-600">New Companies</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.activityMetrics.newUsersThisMonth}</p>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.activityMetrics.surveysCreatedThisMonth}</p>
              <p className="text-sm text-gray-600">Surveys Created</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.activityMetrics.responsesThisMonth}</p>
              <p className="text-sm text-gray-600">Survey Responses</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Super Admins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{analytics.userRoleDistribution.super_admin}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.userRoleDistribution.super_admin, analytics.overview.totalUsers)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Company Admins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{analytics.userRoleDistribution.company_admin}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.userRoleDistribution.company_admin, analytics.overview.totalUsers)})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Company Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{analytics.userRoleDistribution.company_user}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercentage(analytics.userRoleDistribution.company_user, analytics.overview.totalUsers)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analytics.subscriptionAnalytics).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(plan)}`}>
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{count}</span>
                    <span className="text-xs text-gray-500">
                      ({formatPercentage(count, analytics.overview.totalCompanies)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Company Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surveys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.companyBreakdown
                  .sort((a, b) => b.user_count - a.user_count)
                  .slice(0, 10)
                  .map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(company.subscription_plan)}`}>
                        {company.subscription_plan.charAt(0).toUpperCase() + company.subscription_plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.user_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.survey_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        company.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.is_active ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}