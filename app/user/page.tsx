'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { UserWithProfile } from '@/lib/utils'
import RoleBasedNav from '@/components/navigation/RoleBasedNav'

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
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNav user={user} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              👤 Employee Dashboard
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>
              <p className="text-gray-600 mb-4">View and complete your assigned surveys.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800">My Surveys</h3>
                  <p className="text-sm text-yellow-600">Assigned surveys</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800">Profile</h3>
                  <p className="text-sm text-blue-600">Update your information</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800">History</h3>
                  <p className="text-sm text-green-600">Completed surveys</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}