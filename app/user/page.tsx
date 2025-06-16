// app/user/page.tsx - Updated User Dashboard
'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { UserWithProfile } from '@/lib/utils'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'

export default function CompanyUserDashboard() {
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

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

  if (!user) {
    return <div>Error loading user</div>
  }

  return (
    <AuthenticatedLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user.name}! Here are your assigned surveys and tasks.
          </p>
        </div>

        {/* User dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Pending Surveys</h3>
            <p className="text-2xl font-bold text-yellow-600">3</p>
            <p className="text-sm text-gray-600">Awaiting your response</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Completed</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600">Surveys completed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Response Rate</h3>
            <p className="text-2xl font-bold text-blue-600">100%</p>
            <p className="text-sm text-gray-600">Keep it up!</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}