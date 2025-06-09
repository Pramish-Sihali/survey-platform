import { useState } from 'react'
import { ArrowRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeInfo } from '@/lib/utils'

// Mock departments - this would come from your backend/admin settings
const DEPARTMENTS = [
  'Human Resources',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Customer Service',
  'Legal',
  'IT Support',
  'Research & Development'
]

interface EmployeeInfoFormProps {
  employeeInfo: EmployeeInfo
  setEmployeeInfo: (info: EmployeeInfo) => void
  onSubmit: (info: EmployeeInfo) => void
}

export function EmployeeInfoForm({ employeeInfo, setEmployeeInfo, onSubmit }: EmployeeInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!employeeInfo.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!employeeInfo.designation.trim()) {
      newErrors.designation = 'Designation is required'
    }

    if (!employeeInfo.department.trim()) {
      newErrors.department = 'Department is required'
    }

    if (!employeeInfo.supervisor.trim()) {
      newErrors.supervisor = 'Supervisor is required'
    }

    if (!employeeInfo.reportsTo.trim()) {
      newErrors.reportsTo = 'Reports To is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(employeeInfo)
    }
  }

  const updateField = (field: keyof EmployeeInfo, value: string) => {
    setEmployeeInfo({ ...employeeInfo, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">Employee Information</CardTitle>
        <CardDescription className="text-lg">
          Please provide your details to begin the survey. All information is confidential and used for analytical purposes only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={employeeInfo.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                placeholder="e.g., Software Engineer"
                value={employeeInfo.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                className={errors.designation ? 'border-destructive' : ''}
              />
              {errors.designation && (
                <p className="text-sm text-destructive">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={employeeInfo.department} 
                onValueChange={(value) => updateField('department', value)}
              >
                <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Immediate Supervisor *</Label>
              <Input
                id="supervisor"
                placeholder="Supervisor's name"
                value={employeeInfo.supervisor}
                onChange={(e) => updateField('supervisor', e.target.value)}
                className={errors.supervisor ? 'border-destructive' : ''}
              />
              {errors.supervisor && (
                <p className="text-sm text-destructive">{errors.supervisor}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reportsTo">Reports To *</Label>
              <Input
                id="reportsTo"
                placeholder="Who do you report to?"
                value={employeeInfo.reportsTo}
                onChange={(e) => updateField('reportsTo', e.target.value)}
                className={errors.reportsTo ? 'border-destructive' : ''}
              />
              {errors.reportsTo && (
                <p className="text-sm text-destructive">{errors.reportsTo}</p>
              )}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy Notice:</strong> Your information will be kept confidential and used only for survey analysis. 
              Individual responses will not be shared with management without aggregation.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="px-8">
              Continue to Survey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}