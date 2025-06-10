import Link from 'next/link'
import { ClipboardList, BarChart3, Settings, ArrowRight, Users, Shield, Clock } from 'lucide-react'
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
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">i</span>
              </div>
              <span className="text-3xl font-bold text-foreground">
                <span className="text-primary">IXI</span>corp Survey Platform
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Professional Survey &<br />
            <span className="text-primary">Feedback Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your organization's feedback collection with our comprehensive survey platform. 
            Gather insights&lsquo; analyze data, and drive meaningful improvements across your teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/surveys">
              <Button size="lg" className="px-8 py-6 text-lg">
                <ClipboardList className="mr-2 h-6 w-6" />
                Take a Survey
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <BarChart3 className="mr-2 h-6 w-6" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <ClipboardList className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-xl">Smart Survey Builder</CardTitle>
              <CardDescription>
                Create comprehensive surveys with multiple question types, sections, and advanced logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Multiple question types (rating, text, multiple choice)</li>
                <li>• Conditional logic and branching</li>
                <li>• Section-based organization</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-secondary mb-4" />
              <CardTitle className="text-xl">Real-time Analytics</CardTitle>
              <CardDescription>
                Get instant insights with comprehensive analytics and beautiful visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Live response tracking</li>
                <li>• Department-wise breakdowns</li>
                <li>• Interactive charts and graphs</li>
                <li>• Export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-xl">Enterprise Security</CardTitle>
              <CardDescription>
                Built with privacy and security in mind to protect sensitive employee feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Anonymous response options</li>
                <li>• Secure data encryption</li>
                <li>• GDPR compliant</li>
                <li>• Role-based access control</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-2xl">For Employees</CardTitle>
              <CardDescription className="text-base">
                Share your thoughts and contribute to organizational improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Participate in surveys to help shape your workplace culture, policies, and overall employee experience.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Quick & Easy</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Confidential</span>
                </div>
              </div>
              <Link href="/surveys">
                <Button className="w-full">
                  Browse Available Surveys
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <Settings className="h-10 w-10 text-secondary mb-2" />
              <CardTitle className="text-2xl">For Administrators</CardTitle>
              <CardDescription className="text-base">
                Create surveys, manage responses, and analyze organizational insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Design comprehensive surveys, track responses in real-time, and generate actionable insights for your organization.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>Survey Builder</span>
                </div>
              </div>
              <Link href="/admin">
                <Button variant="secondary" className="w-full">
                  Access Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      
      </div>
    </div>
  )
}