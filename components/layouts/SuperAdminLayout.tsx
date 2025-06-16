'use client'

import { ReactNode } from 'react'
import { SafeUserWithProfile } from '@/lib/types'
import { SuperAdminNav } from './SuperAdminNav'
import { AuthService } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'

interface SuperAdminLayoutProps {
  children: ReactNode
  user: SafeUserWithProfile
}

export function SuperAdminLayout({ children, user }: SuperAdminLayoutProps) {
  const handleLogout = async () => {
    try {
      await AuthService.logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout on client side even if API call fails
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Survey Platform
                  <span className="text-yellow-600 ml-2">Super Admin</span>
                </h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500">Super Admin</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <SuperAdminNav />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}