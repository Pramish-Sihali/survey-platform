
// components/layouts/FormLayout.tsx (for survey forms - keeps current style)
'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface FormLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
  backHref?: string
}

export function FormLayout({ children, showBackButton = true, backHref = "/surveys" }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Simple Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href={backHref} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">Back</span>
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span>corp Survey
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Full-width content */}
      {children}
    </div>
  )
}