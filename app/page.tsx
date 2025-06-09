import Link from 'next/link'
import { ArrowRight, ClipboardList, Users, BarChart3, Shield, Star, TrendingUp, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-secondary-50/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">i</span>
              </div>
              <span className="text-3xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">IXI</span>corp
              </span>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-all duration-300">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-8 animate-pulse">
            <Star className="h-4 w-4" />
            Trusted by 500+ organizations worldwide
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
            Employee{' '}
            <span className="bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent">
              Feedback
            </span>{' '}
            <br />
            Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Streamlined survey collection and analytics designed for modern organizations. 
            Gather meaningful insights from your team with our intuitive, secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/form">
              <Button size="lg" className="text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary to-primary-600">
                Start Survey <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-7 rounded-xl hover:bg-primary/5 transition-all duration-300">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">2.5M+</div>
              <div className="text-sm text-muted-foreground">Surveys Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15min</div>
              <div className="text-sm text-muted-foreground">Average Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">IXI</span> Survey Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for the modern workplace with features that matter most to HR teams and employees alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-background to-primary-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ClipboardList className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Smart Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Dynamic question types with intelligent branching and validation for comprehensive data collection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-background to-primary-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Employee Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Designed specifically for employee feedback with department tracking and role-based insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-background to-secondary-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Instant insights with visual charts and comprehensive reporting for data-driven decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-background to-primary-50/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Secure & Professional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Enterprise-grade security with clean, professional interface that employees trust.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-8">
                Powerful Features for{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Modern Teams
                </span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Advanced Question Types</h4>
                    <p className="text-muted-foreground">Rating scales, multiple choice, conditional logic, and custom validations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Real-time Dashboards</h4>
                    <p className="text-muted-foreground">Monitor response rates and insights as they come in with live analytics.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Lightning Fast Setup</h4>
                    <p className="text-muted-foreground">Deploy surveys in minutes with our intuitive admin interface and templates.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-background border rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary/20 rounded w-1/2"></div>
                  <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg"></div>
                    <div className="h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Transform Your Feedback Process?</h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join hundreds of organizations using our platform to gather valuable employee insights and drive meaningful change.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/form">
                <Button size="lg" className="text-lg px-12 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary to-primary-600">
                  Begin Your Survey Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-12 py-7 rounded-xl hover:bg-primary/5 transition-all duration-300">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              No credit card required • Free 14-day trial • Setup in under 15 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">i</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">IXI</span>corp
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 IXIcorp. Professional survey solutions for modern organizations.
          </p>
        </div>
      </footer>
    </div>
  )
}