'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile } from '@/lib/types'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { Users, Building2, BarChart3, AlertCircle, Plus, TrendingUp } from 'lucide-react'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'

interface PlatformStats {
  companies: { total: number; active: number }
  users: { total: number; active: number }
  surveys: { total: number; active: number }
  responses: { total: number }
  pending_issues: number
}

interface RecentActivity {
  companies: Array<{ name: string; created_at: string }>
  users: Array<{ name: string; created_at: string; companies?: { name: string } }>
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get current user
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)

        // Fetch platform stats
        const response = await fetch('/api/super-admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch platform stats')
        }
        
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recent_activity)

      } catch (error) {
        console.error('Error loading dashboard:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-company':
        router.push('/super-admin/companies/new')
        break
      case 'view-analytics':
        router.push('/super-admin/analytics')
        break
      case 'manage-companies':
        router.push('/super-admin/companies')
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Error loading dashboard'}</p>
        </div>
      </div>
    )
  }

  return (
    <SuperAdminLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening across the platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.companies.total || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats?.companies.active || 0} active
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.users.total || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats?.users.active || 0} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Surveys</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.surveys.active || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats?.responses.total || 0} responses
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.pending_issues || 0}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Assignments pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleQuickAction('add-company')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900">Add New Company</h4>
                <p className="text-sm text-gray-600">Create a new company account</p>
              </button>
              
              <button 
                onClick={() => handleQuickAction('view-analytics')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 text-gray-400 group-hover:text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900">View Analytics</h4>
                <p className="text-sm text-gray-600">Platform-wide insights</p>
              </button>
              
              <button 
                onClick={() => handleQuickAction('manage-companies')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-6 w-6 text-gray-400 group-hover:text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900">Manage Companies</h4>
                <p className="text-sm text-gray-600">View and edit all companies</p>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Companies */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Companies</h3>
                {recentActivity.companies.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.companies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(company.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No recent companies</p>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                {recentActivity.users.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.users.map((user, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {user.companies?.name || 'No company'} • {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No recent users</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}