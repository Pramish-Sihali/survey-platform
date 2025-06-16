'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile, CompanyWithStats } from '@/lib/types'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { 
  Building2, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreVertical,
  CheckCircle,
  XCircle 
} from 'lucide-react'

export default function CompaniesPage() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [companies, setCompanies] = useState<CompanyWithStats[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)

        const companiesData = await ApiClient.getCompanies()
        setCompanies(companiesData.companies)
        setFilteredCompanies(companiesData.companies)
      } catch (error) {
        console.error('Error loading companies:', error)
        setError('Failed to load companies')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = companies

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewCompany = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}`)
  }

  const handleEditCompany = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}/edit`)
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
    <AuthenticatedLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-2">Manage all client companies on the platform</p>
          </div>
          <button
            onClick={() => router.push('/super-admin/companies/new')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {error ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' ? 'No companies match your filters' : 'No companies found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      {company.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    {company.domain && (
                      <p className="text-sm text-gray-600 truncate">{company.domain}</p>
                    )}
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-2">
                      {company.subscription_plan}
                    </span>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{company.user_count || 0}</p>
                    <p className="text-xs text-gray-600">Users</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{company.survey_count || 0}</p>
                    <p className="text-xs text-gray-600">Surveys</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{company.active_assignments || 0}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewCompany(company.id)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditCompany(company.id)}
                    className="flex-1 px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}