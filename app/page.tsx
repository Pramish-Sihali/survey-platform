import Link from 'next/link'
import { ArrowRight, ClipboardList, Users, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">i</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                <span className="text-primary">IXI</span>corp
              </span>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Employee <span className="text-primary">Feedback</span> Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Streamlined survey collection and analytics designed for modern organizations. 
            Gather meaningful insights from your team with our intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/form">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Survey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-primary">IXI</span> Survey Platform?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <ClipboardList className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Smart Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Dynamic question types with intelligent branching and validation for comprehensive data collection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-xl">Employee Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Designed specifically for employee feedback with department tracking and role-based insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Instant insights with visual charts and comprehensive reporting for data-driven decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-xl">Secure & Professional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Enterprise-grade security with clean, professional interface that employees trust.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of organizations using our platform to gather valuable employee insights.
            </p>
            <Link href="/form">
              <Button size="lg" className="text-lg px-12 py-6">
                Begin Your Survey Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">i</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary">IXI</span>corp
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