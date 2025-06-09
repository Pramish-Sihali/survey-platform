import Link from 'next/link'
import { Settings, BarChart3, ClipboardList, Users, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  // This would come from your backend
  const formStatus = {
    isOpen: true,
    totalResponses: 47,
    lastResponse: '2 hours ago',
  }

  const quickStats = {
    totalEmployees: 150,
    responseRate: 31.3,
    avgCompletionTime: '8 minutes',
    sectionsComplete: 3,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Back to Site</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">i</span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  <span className="text-primary">IXI</span> Admin
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Survey Status:</span>
              <div className="flex items-center space-x-1">
                {formStatus.isOpen ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Open</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Closed</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage your employee survey and view response analytics
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formStatus.totalResponses}</div>
              <p className="text-sm text-muted-foreground">of {quickStats.totalEmployees} employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{quickStats.responseRate}%</div>
              <p className="text-sm text-muted-foreground">participation rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{quickStats.avgCompletionTime}</div>
              <p className="text-sm text-muted-foreground">per survey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{formStatus.lastResponse}</div>
              <p className="text-sm text-muted-foreground">most recent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                Comprehensive insights and response analysis with charts and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/analytics">
                <Button className="w-full">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <ClipboardList className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Manage Questions</CardTitle>
              <CardDescription>
                Create, edit, and organize survey questions and sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/questions">
                <Button variant="outline" className="w-full">
                  Edit Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Settings className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Survey Settings</CardTitle>
              <CardDescription>
                Configure survey status, departments, and general settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full">
                  Manage Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest survey submissions and system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">New response submitted</p>
                  <p className="text-sm text-muted-foreground">Engineering Department</p>
                </div>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">New response submitted</p>
                  <p className="text-sm text-muted-foreground">Marketing Department</p>
                </div>
                <span className="text-sm text-muted-foreground">3 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">New response submitted</p>
                  <p className="text-sm text-muted-foreground">Human Resources Department</p>
                </div>
                <span className="text-sm text-muted-foreground">5 hours ago</span>
              </div>
              <div className="pt-4">
                <Link href="/admin/analytics">
                  <Button variant="ghost" className="w-full">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}