import Link from 'next/link'
import { CheckCircle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmployeeInfo } from '@/lib/utils'

interface FormCompleteProps {
  employeeInfo: EmployeeInfo
}

export function FormComplete({ employeeInfo }: FormCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-green-600">Survey Completed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for taking the time to provide your valuable feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Submission Summary</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>
                <p className="font-medium">{employeeInfo.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <p className="font-medium">{employeeInfo.department}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Designation:</span>
                <p className="font-medium">{employeeInfo.designation}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
            <h3 className="font-semibold text-primary mb-3">What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Your responses have been securely recorded and will remain confidential
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Your feedback will be analyzed along with other employee responses
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Results will be compiled into actionable insights for organizational improvement
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                You may receive updates about initiatives based on survey findings
              </li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your participation helps create a better workplace for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => window.print()}
                className="w-full sm:w-auto"
              >
                Print Confirmation
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              If you have any questions about this survey, please contact HR or your supervisor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}