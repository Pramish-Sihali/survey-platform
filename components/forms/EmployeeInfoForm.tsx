import { useState, useEffect } from 'react'
import { ArrowRight, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeInfo, Department, ApiClient } from '@/lib/utils'

interface EmployeeInfoFormProps {
  employeeInfo: EmployeeInfo
  setEmployeeInfo: (info: EmployeeInfo) => void
  onSubmit: (info: EmployeeInfo) => void
}

export function EmployeeInfoForm({ employeeInfo, setEmployeeInfo, onSubmit }: EmployeeInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const response = await ApiClient.getDepartments()
        setDepartments(response.departments || [])
      } catch (err) {
        console.error('Error fetching departments:', err)
        // Fallback to hardcoded departments if API fails
        setDepartments([
          { id: '1', company_id: 'fallback', name: 'Human Resources', description: 'HR Department', is_active: true, created_at: '', updated_at: '' },
          { id: '2', company_id: 'fallback', name: 'Engineering', description: 'Engineering Department', is_active: true, created_at: '', updated_at: '' },
          { id: '3', company_id: 'fallback', name: 'Marketing', description: 'Marketing Department', is_active: true, created_at: '', updated_at: '' },
          { id: '4', company_id: 'fallback', name: 'Sales', description: 'Sales Department', is_active: true, created_at: '', updated_at: '' },
          { id: '5', company_id: 'fallback', name: 'Finance', description: 'Finance Department', is_active: true, created_at: '', updated_at: '' },
          { id: '6', company_id: 'fallback', name: 'Operations', description: 'Operations Department', is_active: true, created_at: '', updated_at: '' },
          { id: '7', company_id: 'fallback', name: 'Customer Service', description: 'Customer Service Department', is_active: true, created_at: '', updated_at: '' },
          { id: '8', company_id: 'fallback', name: 'Legal', description: 'Legal Department', is_active: true, created_at: '', updated_at: '' },
          { id: '9', company_id: 'fallback', name: 'IT Support', description: 'IT Support Department', is_active: true, created_at: '', updated_at: '' },
          { id: '10', company_id: 'fallback', name: 'Research & Development', description: 'R&D Department', is_active: true, created_at: '', updated_at: '' }
        ])
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!employeeInfo.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (employeeInfo.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!employeeInfo.designation.trim()) {
      newErrors.designation = 'Designation is required'
    } else if (employeeInfo.designation.trim().length < 2) {
      newErrors.designation = 'Designation must be at least 2 characters'
    }

    if (!employeeInfo.department.trim()) {
      newErrors.department = 'Department is required'
    }

    if (!employeeInfo.supervisor.trim()) {
      newErrors.supervisor = 'Supervisor is required'
    } else if (employeeInfo.supervisor.trim().length < 2) {
      newErrors.supervisor = 'Supervisor name must be at least 2 characters'
    }

    if (!employeeInfo.reportsTo.trim()) {
      newErrors.reportsTo = 'Reports To is required'
    } else if (employeeInfo.reportsTo.trim().length < 2) {
      newErrors.reportsTo = 'Reports To must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      onSubmit(employeeInfo)
    } catch (err) {
      console.error('Error submitting employee info:', err)
    } finally {
      setSubmitting(false)
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
                disabled={submitting}
                autoComplete="name"
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
                disabled={submitting}
                autoComplete="organization-title"
              />
              {errors.designation && (
                <p className="text-sm text-destructive">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              {loadingDepartments ? (
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading departments...</span>
                </div>
              ) : (
                <Select 
                  value={employeeInfo.department} 
                  onValueChange={(value) => updateField('department', value)}
                  disabled={submitting}
                >
                  <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                disabled={submitting}
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
                disabled={submitting}
              />
              {errors.reportsTo && (
                <p className="text-sm text-destructive">{errors.reportsTo}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This may be the same as your immediate supervisor or a higher-level manager
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy Notice:</strong> Your information will be kept confidential and used only for survey analysis. 
              Individual responses will not be shared with management without aggregation. All data is stored securely and in compliance with privacy regulations.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={submitting || loadingDepartments}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Survey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}