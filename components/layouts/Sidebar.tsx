// components/layouts/Sidebar.tsx - FIXED POSITIONING
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { UserWithProfile } from '@/lib/utils'
import { RoleManager } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: UserWithProfile
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string | number
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const getNavItems = (): NavItem[] => {
    if (RoleManager.isSuperAdmin(user)) {
      return [
        { href: '/super-admin', label: 'Dashboard', icon: <DashboardIcon /> },
        { href: '/super-admin/companies', label: 'Companies', icon: <CompaniesIcon /> },
        { href: '/super-admin/analytics', label: 'Platform Analytics', icon: <AnalyticsIcon /> },
        { href: '/super-admin/users', label: 'All Users', icon: <UsersIcon /> },
      ]
    }
    
    if (RoleManager.isCompanyAdmin(user)) {
      return [
        { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
        { href: '/admin/surveys', label: 'Surveys', icon: <SurveyIcon /> },
        { href: '/admin/users', label: 'Users', icon: <UsersIcon /> },
        { href: '/admin/assignments', label: 'Assignments', icon: <AssignmentIcon /> },
        { href: '/admin/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
        { href: '/admin/departments', label: 'Departments', icon: <DepartmentIcon /> },
      ]
    }
    
    return [
      { href: '/user', label: 'Dashboard', icon: <DashboardIcon /> },
      { href: '/user/surveys', label: 'My Surveys', icon: <SurveyIcon /> },
      { href: '/user/assignments', label: 'Assignments', icon: <AssignmentIcon /> },
      { href: '/user/profile', label: 'Profile', icon: <ProfileIcon /> },
    ]
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Fixed positioning with proper z-index */}
      <aside
        className={cn(
          // Base styles - fixed position, full height from top
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30",
          // Transform for mobile
          "transform transition-transform duration-300 ease-in-out",
          // Desktop: always visible, Mobile: slide in/out
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar content container with proper padding for header */}
        <div className="flex flex-col h-full pt-16">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              <span className="font-bold text-gray-900">IXIcorp</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Logo section for desktop */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-teal-600">IXI</span>corp Survey
              </h1>
              <p className="text-xs text-gray-500">
                {user.role === 'super_admin' ? 'Super Admin' : 
                 user.role === 'company_admin' ? 'Company Admin' : 
                 'Employee'} Portal
              </p>
            </div>
          </div>

          {/* Navigation - scrollable area */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && item.href !== '/user' && item.href !== '/super-admin' && 
                 pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-yellow-600" : "text-gray-400 group-hover:text-gray-600"
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info at bottom (mobile only) */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// Icon components (same as before but with consistent sizing)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
  </svg>
)

const CompaniesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const SurveyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const AssignmentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const DepartmentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)