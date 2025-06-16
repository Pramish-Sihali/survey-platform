'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { ApiClient } from '@/lib/api/client'
import { SafeUserWithProfile } from '@/lib/types'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { ArrowLeft, Building2, Save, AlertCircle } from 'lucide-react'

export default function NewCompanyPage() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    subscription_plan: 'basic' as 'basic' | 'professional' | 'premium' | 'enterprise',
    max_users: 50,
    max_surveys: 10,
    is_active: true
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)

      if (!currentUser || currentUser.role !== 'super_admin') {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setError('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Company name is required'
    }
    if (formData.name.trim().length < 2) {
      return 'Company name must be at least 2 characters'
    }
    if (formData.domain && formData.domain.trim()) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
      if (!domainRegex.test(formData.domain.trim())) {
        return 'Please enter a valid domain'
      }
    }
    if (formData.max_users < 1) {
      return 'Max users must be at least 1'
    }
    if (formData.max_surveys < 1) {
      return 'Max surveys must be at least 1'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      const companyData = {
        name: formData.name.trim(),
        domain: formData.domain.trim() || undefined,
        subscription_plan: formData.subscription_plan,
        max_users: formData.max_users,
        max_surveys: formData.max_surveys,
        is_active: formData.is_active
      }

      await ApiClient.createCompany(companyData)
      router.push('/super-admin/companies')
    } catch (error) {
      console.error('Error creating company:', error)
      setError(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Access denied'}</p>
        </div>
      </div>
    )
  }

  return (
    <SuperAdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/super-admin/companies')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Building2 className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Company</h1>
              <p className="text-gray-600 mt-1">Add a new client company to the platform</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional company domain</p>
                </div>
              </div>
            </div>

            {/* Subscription Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan
                  </label>
                  <select
                    id="subscription_plan"
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="max_users" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    id="max_users"
                    name="max_users"
                    value={formData.max_users}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="max_surveys" className="block text-sm font-medium text-gray-700 mb-2">
                    Max Surveys
                  </label>
                  <input
                    type="number"
                    id="max_surveys"
                    name="max_surveys"
                    value={formData.max_surveys}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Plan descriptions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Plan Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Basic</div>
                    <div className="text-gray-600">50 users, 10 surveys</div>
                    <div className="text-green-600 font-medium">$29/month</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Professional</div>
                    <div className="text-gray-600">100 users, 25 surveys</div>
                    <div className="text-green-600 font-medium">$99/month</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Premium</div>
                    <div className="text-gray-600">200 users, 50 surveys</div>
                    <div className="text-green-600 font-medium">$199/month</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-900">Enterprise</div>
                    <div className="text-gray-600">500 users, 100 surveys</div>
                    <div className="text-green-600 font-medium">$499/month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active (company can use the platform immediately)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Creating...' : 'Create Company'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/super-admin/companies')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </SuperAdminLayout>
  )
}