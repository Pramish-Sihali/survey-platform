// components/layouts/AuthenticatedLayout.tsx - FIXED POSITIONING
'use client'

import { useState } from 'react'
import { UserWithProfile } from '@/lib'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

interface AuthenticatedLayoutProps {
  user: UserWithProfile
  children: React.ReactNode
}

export function AuthenticatedLayout({ user, children }: AuthenticatedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top, full width */}
      <Header 
        user={user} 
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Sidebar - Fixed position */}
      <Sidebar 
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area - Properly positioned to account for sidebar */}
      <main className="pt-16 lg:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
        
    
      </main>
    </div>
  )
}
