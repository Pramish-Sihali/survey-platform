// app/page.tsx - Clean Professional Home/Landing Page with Green/Yellow Gradients
'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, BarChart3, Shield, ClipboardList, Star, TrendingUp, Zap } from 'lucide-react'
import { PublicLayout } from '@/components/layouts/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-yellow-500/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-yellow-100 border border-green-200 rounded-full text-sm font-medium text-green-700 mb-8">
            <Star className="h-4 w-4" />
            Trusted by 500+ organizations worldwide
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 bg-clip-text text-transparent">
              Employee
            </span>{' '}
            <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
              Feedback
            </span>{' '}
            <span className="bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Streamlined survey collection and analytics designed for modern organizations. 
            Gather meaningful insights from your team with our intuitive, secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/surveys">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 justify-center shadow-lg">
                Start Survey <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg">
                Access Dashboard
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-sm text-gray-600 font-medium">Response Rate</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-yellow-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-2">2.5M+</div>
              <div className="text-sm text-gray-600 font-medium">Surveys Completed</div>
            </div>
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">15min</div>
              <div className="text-sm text-gray-600 font-medium">Average Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                Why Choose Our
              </span>{' '}
              <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                Survey Platform?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for the modern workplace with features that matter most to HR teams and employees alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-sm border border-green-100 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent mb-3">Smart Forms</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dynamic question types with intelligent branching and validation for comprehensive data collection.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-8 shadow-sm border border-yellow-100 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-800 to-yellow-600 bg-clip-text text-transparent mb-3">Employee Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  Designed specifically for employee feedback with department tracking and role-based insights.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-sm border border-green-100 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent mb-3">Real-time Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Instant insights with visual charts and comprehensive reporting for data-driven decisions.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-8 shadow-sm border border-yellow-100 hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-800 to-yellow-600 bg-clip-text text-transparent mb-3">Secure & Professional</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security with clean, professional interface that employees trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                  Powerful Features for
                </span>{' '}
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                  Modern Teams
                </span>
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">Advanced Question Types</h4>
                    <p className="text-gray-600 text-lg">Rating scales, multiple choice, conditional logic, and custom validations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 bg-gradient-to-r from-yellow-800 to-yellow-600 bg-clip-text text-transparent">Real-time Dashboards</h4>
                    <p className="text-gray-600 text-lg">Monitor response rates and insights as they come in with live analytics.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3 bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">Lightning Fast Setup</h4>
                    <p className="text-gray-600 text-lg">Deploy surveys in minutes with our intuitive admin interface and templates.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-12 border border-green-100">
              <div className="space-y-6">
                <div className="h-6 bg-gradient-to-r from-green-300 to-green-400 rounded-lg w-3/4"></div>
                <div className="h-6 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-lg w-1/2"></div>
                <div className="h-6 bg-gradient-to-r from-green-300 to-yellow-300 rounded-lg w-5/6"></div>
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="h-20 bg-white/80 rounded-xl border border-green-200 shadow-sm"></div>
                  <div className="h-20 bg-white/80 rounded-xl border border-yellow-200 shadow-sm"></div>
                  <div className="h-20 bg-white/80 rounded-xl border border-green-200 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-100 via-green-50 to-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-green-100">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-700 to-yellow-600 bg-clip-text text-transparent">
                Ready to Transform Your Feedback Process?
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Join hundreds of organizations using our platform to gather valuable employee insights and drive meaningful change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <button className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 text-lg shadow-lg">
                  Access Your Dashboard
                </button>
              </Link>
              <Link href="/surveys">
                <button className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-200 text-lg shadow-lg">
                  Browse Public Surveys
                </button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              No credit card required • Free 14-day trial • Setup in under 15 minutes
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}