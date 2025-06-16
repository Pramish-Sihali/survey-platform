'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile, CompanyWithStats } from '@/lib/types'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { 
  Building2, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Crown,
  UserMinus,
  UserPlus,
  Shield,
  AlertTriangle
} from 'lucide-react'

interface CompanyWithUsers extends CompanyWithStats {
  users: Array<{
    id: string
    name: string
    email: string
    role: 'company_admin' | 'company_user'
    is_active: boolean
    last_login: string | null
  }>
}

export default function SuperAdminCompaniesPage() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [companies, setCompanies] = useState<CompanyWithUsers[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithUsers[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = companies

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.users.some(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company =>
        filterStatus === 'active' ? company.is_active : !company.is_active
      )
    }

    setFilteredCompanies(filtered)
  }, [companies, searchTerm, filterStatus])

  const loadData = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)

      // Get companies with their users
      const companiesResponse = await ApiClient.getCompanies()
      const companiesWithUsers = await Promise.all(
        companiesResponse.companies.map(async (company) => {
          try {
            const usersResponse = await ApiClient.getUsers({ company_id: company.id })
            return {
              ...company,
              users: usersResponse.users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role as 'company_admin' | 'company_user',
                is_active: user.is_active,
                last_login: user.last_login
              }))
            }
          } catch (error) {
            console.error(`Error loading users for company ${company.id}:`, error)
            return { ...company, users: [] }
          }
        })
      )

      setCompanies(companiesWithUsers)
    } catch (error) {
      console.error('Error loading companies:', error)
      setError('Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone and will remove all associated users and data.`)) {
      return
    }

    setActionLoading(companyId)
    try {
      await ApiClient.deleteCompany(companyId)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
    setActionLoading(companyId)
    try {
      await ApiClient.updateCompany(companyId, { is_active: !currentStatus })
      await loadData() // Reload data
    } catch (error) {
      console.error('Error updating company status:', error)
      alert('Failed to update company status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromoteToAdmin = async (userId: string, userName: string, companyId: string) => {
    if (!confirm(`Promote ${userName} to Company Administrator? They will gain administrative privileges for their company.`)) {
      return
    }

    setActionLoading(userId)
    try {
      await ApiClient.updateUser(userId, { role: 'company_admin' })
      await loadData() // Reload data
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('Failed to promote user. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemoteFromAdmin = async (userId: string, userName: string, companyId: string) => {
    if (!confirm(`Remove ${userName} from Company Administrator role? They will become a regular company user.`)) {
      return
    }

    setActionLoading(userId)
    try {
      await ApiClient.updateUser(userId, { role: 'company_user' })
      await loadData() // Reload data
    } catch (error) {
      console.error('Error demoting user:', error)
      alert('Failed to update user role. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${userName}?`)) {
      return
    }

    setActionLoading(userId)
    try {
      await ApiClient.updateUser(userId, { is_active: !currentStatus })
      await loadData() // Reload data
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading user</div>
  }

  return (
    <SuperAdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
            <p className="text-gray-600 mt-2">Manage client companies, their users, and administrative roles</p>
          </div>
          <button
            onClick={() => router.push('/super-admin/companies/new')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Company
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {companies.filter(c => c.is_active).length} active
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
                  {companies.reduce((sum, c) => sum + c.users.length, 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {companies.reduce((sum, c) => sum + c.users.filter(u => u.is_active).length, 0)} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Company Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.reduce((sum, c) => sum + c.users.filter(u => u.role === 'company_admin').length, 0)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Across all companies</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Users/Company</p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.length > 0 ? Math.round(companies.reduce((sum, c) => sum + c.users.length, 0) / companies.length) : 0}
                </p>
                <p className="text-xs text-orange-600 mt-1">Per company</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies, users, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Companies</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Companies List */}
        {error ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadData}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' ? 'No companies match your filters' : 'No companies found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Company Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                            {company.is_active ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {company.domain && (
                              <p className="text-sm text-gray-600">{company.domain}</p>
                            )}
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {company.subscription_plan}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Company Stats */}
                      <div className="flex items-center gap-6 mr-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{company.users.length}</p>
                          <p className="text-xs text-gray-600">Users</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {company.users.filter(u => u.role === 'company_admin').length}
                          </p>
                          <p className="text-xs text-gray-600">Admins</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {company.users.filter(u => u.is_active).length}
                          </p>
                          <p className="text-xs text-gray-600">Active</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                          className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {expandedCompany === company.id ? 'Hide Users' : 'View Users'}
                        </button>
                        
                        <button
                          onClick={() => router.push(`/super-admin/companies/${company.id}/edit`)}
                          className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleCompanyStatus(company.id, company.is_active)}
                          disabled={actionLoading === company.id}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                            company.is_active 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {actionLoading === company.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : company.is_active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {company.is_active ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                          disabled={actionLoading === company.id}
                          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          {actionLoading === company.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users List (Expandable) */}
                {expandedCompany === company.id && (
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Users</h4>
                    
                    {company.users.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No users found for this company</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {company.users.map((companyUser) => (
                          <div key={companyUser.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  companyUser.role === 'company_admin' 
                                    ? 'bg-purple-100' 
                                    : 'bg-gray-100'
                                }`}>
                                  {companyUser.role === 'company_admin' ? (
                                    <Crown className="h-5 w-5 text-purple-600" />
                                  ) : (
                                    <Users className="h-5 w-5 text-gray-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{companyUser.name}</p>
                                    {companyUser.is_active ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{companyUser.email}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                      companyUser.role === 'company_admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {companyUser.role === 'company_admin' ? 'Company Admin' : 'User'}
                                    </span>
                                    {companyUser.last_login && (
                                      <span className="text-xs text-gray-500">
                                        Last login: {new Date(companyUser.last_login).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {companyUser.role === 'company_user' ? (
                                  <button
                                    onClick={() => handlePromoteToAdmin(companyUser.id, companyUser.name, company.id)}
                                    disabled={actionLoading === companyUser.id}
                                    className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
                                  >
                                    {actionLoading === companyUser.id ? (
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Crown className="h-3 w-3" />
                                    )}
                                    Promote
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDemoteFromAdmin(companyUser.id, companyUser.name, company.id)}
                                    disabled={actionLoading === companyUser.id}
                                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
                                  >
                                    {actionLoading === companyUser.id ? (
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <UserMinus className="h-3 w-3" />
                                    )}
                                    Demote
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleUserStatus(companyUser.id, companyUser.is_active, companyUser.name)}
                                  disabled={actionLoading === companyUser.id}
                                  className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                    companyUser.is_active
                                      ? 'bg-red-500 hover:bg-red-600 text-white'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }`}
                                >
                                  {actionLoading === companyUser.id ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : companyUser.is_active ? (
                                    <XCircle className="h-3 w-3" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
                                  {companyUser.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}