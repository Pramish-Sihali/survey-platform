// app/admin/users/[id]/edit/page.tsx - Edit User Page
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, User, Building, Calendar, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout'
import { AuthService } from '@/lib/auth'
import { ApiClient, UserWithProfile, SafeUserWithProfile, UserRole, Department } from '@/lib'

interface EditUserForm {
  // Basic Information
  name: string
  email: string
  role: UserRole
  phone: string
  
  // Profile Information
  designation: string
  department_id: string
  supervisor_name: string
  reports_to: string
  hire_date: string
  bio: string
  
  // Account Settings
  is_active: boolean
  password: string
  changePassword: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [currentUser, setCurrentUser] = useState<UserWithProfile | null>(null)
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true)
  const [profileUser, setProfileUser] = useState<SafeUserWithProfile | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState<EditUserForm>({
    name: '',
    email: '',
    role: 'company_user',
    phone: '',
    designation: '',
    department_id: '',
    supervisor_name: '',
    reports_to: '',
    hire_date: '',
    bio: '',
    is_active: true,
    password: '',
    changePassword: false
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<EditUserForm | null>(null)

  // Get current authenticated user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error getting current user:', error)
      } finally {
        setIsLoadingCurrentUser(false)
      }
    }
    getCurrentUser()
  }, [])

  // Fetch user profile and departments
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !userId) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile
        const userResponse = await ApiClient.getUser(userId)
        const user = userResponse.user
        setProfileUser(user)
        
        // Populate form with user data
        const userData: EditUserForm = {
          name: user.name || '',
          email: user.email || '',
          role: user.role,
          phone: user.phone || '',
          designation: user.designation || '',
          department_id: user.department_id || '',
          supervisor_name: user.supervisor_name || '',
          reports_to: user.reports_to || '',
          hire_date: user.hire_date ? user.hire_date.split('T')[0] : '',
          bio: user.bio || '',
          is_active: user.is_active,
          password: '',
          changePassword: false
        }
        
        setFormData(userData)
        setOriginalData(userData)
        
        // Fetch departments
        const response = await fetch(`/api/departments?company_id=${currentUser.company_id}`)
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments || [])
        }
        
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchData()
    }
  }, [currentUser, userId])

  // Check for changes
  useEffect(() => {
    if (!originalData) return
    
    const hasFormChanges = Object.keys(formData).some(key => {
      const typedKey = key as keyof EditUserForm
      return formData[typedKey] !== originalData[typedKey]
    })
    
    setHasChanges(hasFormChanges)
  }, [formData, originalData])

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (formData.changePassword && !formData.password.trim()) {
      newErrors.password = 'New password is required'
    } else if (formData.changePassword && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
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
    
    if (!profileUser) {
      setError('User data is missing')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      // Prepare update data
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role,
        is_active: formData.is_active,
      }
      
      // Add password if changing
      if (formData.changePassword && formData.password) {
        updateData.password = formData.password
      }
      
      // Update user basic info
      await ApiClient.updateUser(profileUser.id, updateData)
      
      // Update profile information separately
      const profileData = {
        designation: formData.designation || null,
        department_id: formData.department_id || null,
        supervisor_name: formData.supervisor_name || null,
        reports_to: formData.reports_to || null,
        phone: formData.phone || null,
        hire_date: formData.hire_date || null,
        bio: formData.bio || null,
      }
      
      await ApiClient.updateUserProfile(profileUser.id, profileData)
      
      // Redirect back to user profile
      router.push(`/admin/users/${profileUser.id}`)
      
    } catch (err: any) {
      console.error('Error updating user:', err)
      
      if (err.message?.includes('email already exists')) {
        setErrors({ email: 'A user with this email already exists' })
      } else {
        setError(err.message || 'Failed to update user')
      }
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof EditUserForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle user deletion
  const handleDelete = async () => {
    if (!profileUser) return
    
    try {
      setSaving(true)
      await ApiClient.deleteUser(profileUser.id)
      router.push('/admin/users')
    } catch (err: any) {
      console.error('Error deleting user:', err)
      setError(err.message || 'Failed to delete user')
      setSaving(false)
    }
  }

  // Generate random password
  const generatePassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    setFormData(prev => ({ ...prev, password }))
  }

  if (isLoadingCurrentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <div>Error loading user</div>
  }

  if (loading) {
    return (
      <AuthenticatedLayout user={currentUser}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error && !profileUser) {
    return (
      <AuthenticatedLayout user={currentUser}>
        <div className="max-w-4xl mx-auto">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Error Loading User</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/users">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout user={currentUser}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/admin/users/${userId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit User
              </h1>
              <p className="text-gray-600 mt-1">
                Update user information and settings
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">You have unsaved changes</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Make sure to save your changes before leaving this page.
              </p>
            </CardContent>
          </Card>
        )}

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
                Update user account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="changePassword">Change Password</Label>
                    <p className="text-sm text-gray-600">
                      Enable to set a new password for this user
                    </p>
                  </div>
                  <Switch
                    id="changePassword"
                    checked={formData.changePassword}
                    onCheckedChange={(checked) => handleInputChange('changePassword', checked)}
                  />
                </div>

                {formData.changePassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password *</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
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
                Update professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Job Title</Label>
                  <Input
                    id="designation"
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
                      <SelectItem value="">No department</SelectItem>
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
                    value={formData.supervisor_name}
                    onChange={(e) => handleInputChange('supervisor_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportsTo">Reports To (Email)</Label>
                  <Input
                    id="reportsTo"
                    type="email"
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
              <div className="flex justify-between">
                <Link href={`/admin/users/${userId}`}>
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                
                <Button type="submit" disabled={saving || !hasChanges}>
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Delete User</CardTitle>
                <CardDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    {saving ? 'Deleting...' : 'Delete User'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}