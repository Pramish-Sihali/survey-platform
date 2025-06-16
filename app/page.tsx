// app/page.tsx - Enhanced Home/Landing Page
'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, BarChart3, Shield, Clock, Star, TrendingUp, Zap, ClipboardList } from 'lucide-react'
import { PublicLayout } from '@/components/layouts/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-sm font-medium text-teal-600 mb-8 animate-pulse">
            <Star className="h-4 w-4" />
            Trusted by 500+ organizations worldwide
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Employee{' '}
            <span className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-500 bg-clip-text text-transparent">
              Feedback
            </span>{' '}
            <br />
            Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Streamlined survey collection and analytics designed for modern organizations. 
            Gather meaningful insights from your team with our intuitive, secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/surveys">
              <button className="text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold">
                Start Survey <ArrowRight className="ml-2 h-6 w-6 inline" />
              </button>
            </Link>
            <Link href="/login">
              <button className="text-lg px-10 py-7 rounded-xl border-2 border-teal-500/20 hover:bg-teal-500/5 transition-all duration-300 text-gray-700 font-semibold">
                Access Dashboard
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">98%</div>
              <div className="text-sm text-gray-500">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-500 mb-2">2.5M+</div>
              <div className="text-sm text-gray-500">Surveys Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">15min</div>
              <div className="text-sm text-gray-500">Average Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Our</span> Survey Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for the modern workplace with features that matter most to HR teams and employees alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-teal-50/30 rounded-lg p-6">
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Forms</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dynamic question types with intelligent branching and validation for comprehensive data collection.
                </p>
              </div>
            </div>

            <div className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-teal-50/30 rounded-lg p-6">
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Employee Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  Designed specifically for employee feedback with department tracking and role-based insights.
                </p>
              </div>
            </div>

            <div className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-cyan-50/30 rounded-lg p-6">
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Instant insights with visual charts and comprehensive reporting for data-driven decisions.
                </p>
              </div>
            </div>

            <div className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-teal-50/30 rounded-lg p-6">
              <div className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Professional</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enterprise-grade security with clean, professional interface that employees trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-8 text-gray-900">
                Powerful Features for{' '}
                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Modern Teams
                </span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Advanced Question Types</h4>
                    <p className="text-gray-600">Rating scales, multiple choice, conditional logic, and custom validations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Real-time Dashboards</h4>
                    <p className="text-gray-600">Monitor response rates and insights as they come in with live analytics.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900">Lightning Fast Setup</h4>
                    <p className="text-gray-600">Deploy surveys in minutes with our intuitive admin interface and templates.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white border rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-4 bg-teal-500/20 rounded w-3/4"></div>
                  <div className="h-4 bg-cyan-500/20 rounded w-1/2"></div>
                  <div className="h-4 bg-teal-500/20 rounded w-5/6"></div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-16 bg-gradient-to-br from-teal-500/10 to-teal-500/5 rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-teal-500/10 to-teal-500/5 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-4xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Ready to Transform Your Feedback Process?</h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Join hundreds of organizations using our platform to gather valuable employee insights and drive meaningful change.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/login">
                <button className="text-lg px-12 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold">
                  Access Your Dashboard
                </button>
              </Link>
              <Link href="/surveys">
                <button className="text-lg px-12 py-7 rounded-xl border-2 border-teal-500/20 hover:bg-teal-500/5 transition-all duration-300 text-gray-700 font-semibold">
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