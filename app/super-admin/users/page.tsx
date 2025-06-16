'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile } from '@/lib/types'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { 
  Users, 
  Search, 
  Filter,
  Crown,
  Building2,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  Shield,
  AlertTriangle,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'

interface UserWithCompany extends SafeUserWithProfile {
  company_name: string | null
}

export default function SuperAdminUsersPage() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [allUsers, setAllUsers] = useState<UserWithCompany[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithCompany[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'company_admin' | 'company_user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = allUsers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.is_active : !user.is_active
      )
    }

    // Filter by company
    if (companyFilter !== 'all') {
      filtered = filtered.filter(user => user.company_id === companyFilter)
    }

    setFilteredUsers(filtered)
  }, [allUsers, searchTerm, roleFilter, statusFilter, companyFilter])

  const loadData = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)

      // Get all users
      const usersResponse = await ApiClient.getUsers()
      
      // Get all companies for the filter
      const companiesResponse = await ApiClient.getCompanies()
      setCompanies(companiesResponse.companies.map(c => ({ id: c.id, name: c.name })))

      // Enhance users with company names
      const usersWithCompanies = usersResponse.users.map(user => ({
        ...user,
        company_name: companiesResponse.companies.find(c => c.id === user.company_id)?.name || null
      }))

      setAllUsers(usersWithCompanies)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
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

  const handleChangeUserRole = async (userId: string, newRole: 'company_admin' | 'company_user', userName: string) => {
    const action = newRole === 'company_admin' ? 'promote to Company Administrator' : 'change to Company User'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} for ${userName}?`)) {
      return
    }

    setActionLoading(userId)
    try {
      await ApiClient.updateUser(userId, { role: newRole })
      await loadData() // Reload data
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'company_admin':
        return 'bg-purple-100 text-purple-800'
      case 'company_user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />
      case 'company_admin':
        return <Crown className="h-4 w-4" />
      case 'company_user':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'company_admin':
        return 'Company Admin'
      case 'company_user':
        return 'Company User'
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users across the platform</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {allUsers.filter(u => u.is_active).length} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allUsers.filter(u => u.role === 'super_admin').length}
                </p>
                <p className="text-xs text-red-600 mt-1">Platform administrators</p>
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
                  {allUsers.filter(u => u.role === 'company_admin').length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Company administrators</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Company Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allUsers.filter(u => u.role === 'company_user').length}
                </p>
                <p className="text-xs text-green-600 mt-1">Regular users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, emails, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="company_admin">Company Admin</option>
              <option value="company_user">Company User</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Company Filter */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Companies</option>
              <option value="">No Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users List */}
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
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || companyFilter !== 'all' 
                ? 'No users match your filters' 
                : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((currentUser) => (
                    <tr key={currentUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-yellow-800">
                                {currentUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {currentUser.email}
                            </div>
                            {currentUser.designation && (
                              <div className="text-xs text-gray-400">
                                {currentUser.designation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {currentUser.company_name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {currentUser.company_name}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No company</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(currentUser.role)}`}>
                          {getRoleIcon(currentUser.role)}
                          {formatRoleName(currentUser.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          currentUser.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentUser.is_active ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {currentUser.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentUser.last_login ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(currentUser.last_login).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Management (only for company users) */}
                          {currentUser.role !== 'super_admin' && currentUser.company_id && (
                            <>
                              {currentUser.role === 'company_user' ? (
                                <button
                                  onClick={() => handleChangeUserRole(currentUser.id, 'company_admin', currentUser.name)}
                                  disabled={actionLoading === currentUser.id}
                                  className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
                                >
                                  {actionLoading === currentUser.id ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Crown className="h-3 w-3" />
                                  )}
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleChangeUserRole(currentUser.id, 'company_user', currentUser.name)}
                                  disabled={actionLoading === currentUser.id}
                                  className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-1"
                                >
                                  {actionLoading === currentUser.id ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <UserMinus className="h-3 w-3" />
                                  )}
                                  Demote
                                </button>
                              )}
                            </>
                          )}

                          {/* Status Toggle (not for super admins) */}
                          {currentUser.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(currentUser.id, currentUser.is_active, currentUser.name)}
                              disabled={actionLoading === currentUser.id}
                              className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                                currentUser.is_active
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {actionLoading === currentUser.id ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : currentUser.is_active ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {currentUser.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-gray-600 text-center">
          Showing {filteredUsers.length} of {allUsers.length} users
        </div>
      </div>
    </SuperAdminLayout>
  )
}