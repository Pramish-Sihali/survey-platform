// components/layouts/Header.tsx - ENSURE PROPER Z-INDEX
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { AuthService } from '@/lib/auth'
import { UserWithProfile } from '@/lib'

interface HeaderProps {
  user: UserWithProfile
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator'
      case 'company_admin': return 'Company Admin'
      case 'company_user': return 'Employee'
      default: return role
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo - visible on mobile, hidden on desktop (desktop logo is in sidebar) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-teal-600">IXI</span>corp Survey
              </h1>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500 text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">{user.name}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.company_name || 'No Company'}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                    <Settings className="h-4 w-4" />
                    Preferences
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}