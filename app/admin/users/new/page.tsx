// app/admin/users/new/page.tsx - Create New User Page
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Mail, User, Building, Calendar, Phone, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { ApiClient, UserWithProfile, UserRole, Department } from '@/lib'

interface CreateUserForm {
  // Basic Information
  name: string
  email: string
  role: UserRole
  password: string
  sendInviteEmail: boolean
  
  // Profile Information
  designation: string
  department_id: string
  supervisor_name: string
  reports_to: string
  phone: string
  hire_date: string
  bio: string
  
  // Status
  is_active: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function NewUserPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')
  
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    role: 'company_user',
    password: '',
    sendInviteEmail: true,
    designation: '',
    department_id: '',
    supervisor_name: '',
    reports_to: '',
    phone: '',
    hire_date: '',
    bio: '',
    is_active: true
  })
  
  const [errors, setErrors] = useState<FormErrors>({})

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    getUser()
  }, [])

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.company_id) return
      
      try {
        // We'll need to create this API endpoint or modify existing one
        const response = await fetch(`/api/departments?company_id=${user.company_id}`)
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments || [])
        }
      } catch (err) {
        console.error('Error fetching departments:', err)
      }
    }
    
    if (user) {
      fetchDepartments()
    }
  }, [user])

  // Generate random password
  const generatePassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('')
    setGeneratedPassword(shuffled)
    setFormData(prev => ({ ...prev, password: shuffled }))
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.sendInviteEmail && !formData.password.trim()) {
      newErrors.password = 'Password is required when not sending invite email'
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    // Email validation for reports_to (optional)
    if (formData.reports_to && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reports_to)) {
      newErrors.reports_to = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (!user?.company_id) {
      setError('Company information is missing')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare user data
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role,
        company_id: user.company_id,
        password: formData.sendInviteEmail ? undefined : formData.password,
        profile: {
          designation: formData.designation || null,
          department_id: formData.department_id || null,
          supervisor_name: formData.supervisor_name || null,
          reports_to: formData.reports_to || null,
          phone: formData.phone || null,
          hire_date: formData.hire_date || null,
          bio: formData.bio || null,
          is_profile_complete: !!(formData.designation && formData.department_id)
        }
      }
      
      const response = await ApiClient.createUser(userData)
      
      // If temporary password was generated, show it to admin
      if (response.temporaryPassword) {
        alert(`User created successfully!\n\nTemporary password: ${response.temporaryPassword}\n\nPlease share this securely with the user.`)
      }
      
      // Redirect to users list
      router.push('/admin/users')
      
    } catch (err: any) {
      console.error('Error creating user:', err)
      
      if (err.message?.includes('email already exists')) {
        setErrors({ email: 'A user with this email already exists' })
      } else {
        setError(err.message || 'Failed to create user')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof CreateUserForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading user</div>
  }

  return (
    <AuthenticatedLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
            <p className="text-gray-600 mt-1">
              Create a new user account for your organization
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">Error</p>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Essential user account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: UserRole) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_user">User</SelectItem>
                      <SelectItem value="company_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Account Setup Options */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Account Setup</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sendInvite">Send Invitation Email</Label>
                    <p className="text-sm text-gray-600">
                      User will receive an email to set up their password
                    </p>
                  </div>
                  <Switch
                    id="sendInvite"
                    checked={formData.sendInviteEmail}
                    onCheckedChange={(checked) => handleInputChange('sendInviteEmail', checked)}
                  />
                </div>

                {!formData.sendInviteEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password *</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter temporary password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                      >
                        Generate
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    {generatedPassword && (
                      <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                        Generated password: <code className="font-mono">{generatedPassword}</code>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Job Information</span>
              </CardTitle>
              <CardDescription>
                Professional details and organizational structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Job Title</Label>
                  <Input
                    id="designation"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => handleInputChange('department_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor Name</Label>
                  <Input
                    id="supervisor"
                    placeholder="Direct supervisor's name"
                    value={formData.supervisor_name}
                    onChange={(e) => handleInputChange('supervisor_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportsTo">Reports To (Email)</Label>
                  <Input
                    id="reportsTo"
                    type="email"
                    placeholder="supervisor@company.com"
                    value={formData.reports_to}
                    onChange={(e) => handleInputChange('reports_to', e.target.value)}
                    className={errors.reports_to ? 'border-red-500' : ''}
                  />
                  {errors.reports_to && <p className="text-sm text-red-600">{errors.reports_to}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Notes</Label>
                <Textarea
                  id="bio"
                  placeholder="Additional information about the user..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Control user account access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isActive">Active Account</Label>
                  <p className="text-sm text-gray-600">
                    User can log in and access the system
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-end space-x-4">
                <Link href="/admin/users">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating User...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Create User</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}