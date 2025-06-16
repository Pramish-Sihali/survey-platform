// app/page.tsx - Minimalistic Professional Home/Landing Page
'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, BarChart3, Shield, ClipboardList, Star, TrendingUp, Zap } from 'lucide-react'
import { PublicLayout } from '@/components/layouts/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Background Blur Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-green-300/20 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8">
            <Star className="h-4 w-4 text-green-500" />
            Trusted by 500+ organizations worldwide
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
            Employee{' '}
            <span className="text-green-800">
              Feedback
            </span>{' '}
            Platform
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-3xl mx-auto">
            Streamlined survey collection and analytics designed for modern organizations. 
            Gather meaningful insights from your team with our intuitive, secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/surveys">
              <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center">
                Start Survey <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-200">
                Access Dashboard
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-800 mb-2">98%</div>
              <div className="text-sm text-gray-400 font-medium">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">2.5M+</div>
              <div className="text-sm text-gray-400 font-medium">Surveys Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-800 mb-2">15min</div>
              <div className="text-sm text-gray-400 font-medium">Average Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        {/* Background Blur Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-200/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Why Choose Our Survey Platform?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built for the modern workplace with features that matter most to HR teams and employees alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="h-6 w-6 text-green-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Forms</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dynamic question types with intelligent branching and validation for comprehensive data collection.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Users className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Employee Focused</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Designed specifically for employee feedback with department tracking and role-based insights.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-6 w-6 text-green-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Instant insights with visual charts and comprehensive reporting for data-driven decisions.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure & Professional</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Enterprise-grade security with clean, professional interface that employees trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        {/* Background Blur Elements */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-green-200/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8 text-gray-900">
                Powerful Features for Modern Teams
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-800" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Advanced Question Types</h4>
                    <p className="text-gray-500">Rating scales, multiple choice, conditional logic, and custom validations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Real-time Dashboards</h4>
                    <p className="text-gray-500">Monitor response rates and insights as they come in with live analytics.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-green-800" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Lightning Fast Setup</h4>
                    <p className="text-gray-500">Deploy surveys in minutes with our intuitive admin interface and templates.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-12">
              <div className="space-y-4">
                <div className="h-3 bg-green-200 rounded w-3/4"></div>
                <div className="h-3 bg-yellow-200 rounded w-1/2"></div>
                <div className="h-3 bg-green-200 rounded w-5/6"></div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="h-16 bg-white rounded-lg border border-gray-200"></div>
                  <div className="h-16 bg-white rounded-lg border border-gray-200"></div>
                  <div className="h-16 bg-white rounded-lg border border-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        {/* Background Blur Elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-yellow-200/25 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Join hundreds of organizations using our platform to gather valuable employee insights and drive meaningful change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200">
                Access Your Dashboard
              </button>
            </Link>
            <Link href="/surveys">
              <button className="px-10 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors duration-200">
                Browse Public Surveys
              </button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-8">
            No credit card required • Free 14-day trial • Setup in under 15 minutes
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}