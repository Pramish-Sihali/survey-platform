'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  Building2, 
  Home, 
  Settings, 
  Users,
  TrendingUp 
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: Home
  },
  {
    name: 'Companies',
    href: '/super-admin/companies',
    icon: Building2
  },
  {
    name: 'Analytics',
    href: '/super-admin/analytics',
    icon: TrendingUp
  },
  {
    name: 'Users',
    href: '/super-admin/users',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/super-admin/settings',
    icon: Settings
  }
]

export function SuperAdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || 
                        (item.href !== '/super-admin' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-yellow-100 text-yellow-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5',
                isActive ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}