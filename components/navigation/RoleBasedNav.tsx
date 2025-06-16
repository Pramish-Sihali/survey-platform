'use client'

// components/navigation/RoleBasedNav.tsx - Role-Based Navigation Components
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService, RoleManager } from '@/lib/auth'
import { UserWithProfile } from '@/lib/'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface NavigationProps {
  user: UserWithProfile
  className?: string
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
  isActive?: boolean
  badge?: string | number
  onClick?: () => void
}

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

function NavItem({ href, label, icon, isActive, badge, onClick }: NavItemProps) {
  const content = (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
      isActive 
        ? "bg-yellow-100 text-yellow-800 shadow-sm" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    )}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
          {badge}
        </span>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  )
}

// ============================================================================
// SUPER ADMIN NAVIGATION
// ============================================================================

export function SuperAdminNav({ user, className }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <nav className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-yellow-600">IXI</span>corp Survey
              </h1>
              <p className="text-xs text-gray-500">Super Admin Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem
              href="/super-admin"
              label="Dashboard"
              icon={<DashboardIcon />}
              isActive={pathname === '/super-admin'}
            />
            <NavItem
              href="/super-admin/companies"
              label="Companies"
              icon={<CompaniesIcon />}
              isActive={pathname.startsWith('/super-admin/companies')}
            />
            <NavItem
              href="/super-admin/analytics"
              label="Analytics"
              icon={<AnalyticsIcon />}
              isActive={pathname.startsWith('/super-admin/analytics')}
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <NavItem
              href="#"
              label="Logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

// ============================================================================
// COMPANY ADMIN NAVIGATION
// ============================================================================

export function CompanyAdminNav({ user, className }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <nav className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-yellow-600">IXI</span>corp Survey
              </h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem
              href="/admin"
              label="Dashboard"
              icon={<DashboardIcon />}
              isActive={pathname === '/admin'}
            />
            <NavItem
              href="/admin/surveys"
              label="Surveys"
              icon={<SurveyIcon />}
              isActive={pathname.startsWith('/admin/surveys')}
            />
            <NavItem
              href="/admin/users"
              label="Users"
              icon={<UsersIcon />}
              isActive={pathname.startsWith('/admin/users')}
            />
            <NavItem
              href="/admin/assignments"
              label="Assignments"
              icon={<AssignmentIcon />}
              isActive={pathname.startsWith('/admin/assignments')}
            />
            <NavItem
              href="/admin/analytics"
              label="Analytics"
              icon={<AnalyticsIcon />}
              isActive={pathname.startsWith('/admin/analytics')}
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Company Admin</p>
            </div>
            <NavItem
              href="#"
              label="Logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

// ============================================================================
// COMPANY USER NAVIGATION
// ============================================================================

export function CompanyUserNav({ user, className }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  return (
    <nav className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-yellow-600">IXI</span>corp Survey
              </h1>
              <p className="text-xs text-gray-500">Employee Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem
              href="/user"
              label="Dashboard"
              icon={<DashboardIcon />}
              isActive={pathname === '/user'}
            />
            <NavItem
              href="/user/surveys"
              label="My Surveys"
              icon={<SurveyIcon />}
              isActive={pathname.startsWith('/user/surveys')}
            />
            <NavItem
              href="/user/profile"
              label="Profile"
              icon={<ProfileIcon />}
              isActive={pathname.startsWith('/user/profile')}
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Employee</p>
            </div>
            <NavItem
              href="#"
              label="Logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

// ============================================================================
// MAIN ROLE-BASED NAVIGATION COMPONENT
// ============================================================================

interface RoleBasedNavProps {
  user: UserWithProfile
  className?: string
}

export default function RoleBasedNav({ user, className }: RoleBasedNavProps) {
  if (RoleManager.isSuperAdmin(user)) {
    return <SuperAdminNav user={user} className={className} />
  }
  
  if (RoleManager.isCompanyAdmin(user)) {
    return <CompanyAdminNav user={user} className={className} />
  }
  
  if (RoleManager.isCompanyUser(user)) {
    return <CompanyUserNav user={user} className={className} />
  }

  // Fallback - should not happen
  return null
}

// ============================================================================
// MOBILE SIDEBAR NAVIGATION
// ============================================================================

interface MobileSidebarProps {
  user: UserWithProfile
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ user, isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const getNavItems = () => {
    if (RoleManager.isSuperAdmin(user)) {
      return [
        { href: '/super-admin', label: 'Dashboard', icon: <DashboardIcon /> },
        { href: '/super-admin/companies', label: 'Companies', icon: <CompaniesIcon /> },
        { href: '/super-admin/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
      ]
    }
    
    if (RoleManager.isCompanyAdmin(user)) {
      return [
        { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
        { href: '/admin/surveys', label: 'Surveys', icon: <SurveyIcon /> },
        { href: '/admin/users', label: 'Users', icon: <UsersIcon /> },
        { href: '/admin/assignments', label: 'Assignments', icon: <AssignmentIcon /> },
        { href: '/admin/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
      ]
    }
    
    return [
      { href: '/user', label: 'Dashboard', icon: <DashboardIcon /> },
      { href: '/user/surveys', label: 'My Surveys', icon: <SurveyIcon /> },
      { href: '/user/profile', label: 'Profile', icon: <ProfileIcon /> },
    ]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              <span className="font-bold text-gray-900">IXIcorp</span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <CloseIcon />
            </button>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {getNavItems().map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              onClick={onClose}
            />
          ))}
          
          <div className="pt-4 border-t mt-4">
            <NavItem
              href="#"
              label="Logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
            />
          </div>
        </nav>
      </div>
    </div>
  )
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
  </svg>
)

const CompaniesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const SurveyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const AssignmentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)