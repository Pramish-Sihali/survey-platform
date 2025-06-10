// app/admin/settings/page.tsx - UPDATED WITH CONSOLIDATED API
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Save, Settings, Building, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Department } from '@/lib/utils'

interface DepartmentFormData {
  id?: string
  name: string
  description: string
  is_active: boolean
}

interface DepartmentFormProps {
  department?: Department
  onSave: (departmentData: DepartmentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

function DepartmentForm({ department, onSave, onCancel, isSubmitting }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    id: department?.id,
    name: department?.name || '',
    description: department?.description || '',
    is_active: department?.is_active ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    await onSave(formData)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{department ? 'Edit Department' : 'Add New Department'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                placeholder="Enter department name..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <span>Active</span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  disabled={isSubmitting}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                Inactive departments won't appear in employee forms
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-description">Description (Optional)</Label>
            <Input
              id="dept-description"
              placeholder="Brief description of the department..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Department
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminSettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [showAddDepartment, setShowAddDepartment] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use consolidated departments API with admin flag
      const response = await fetch('/api/departments?admin=true')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
      } else {
        throw new Error('Failed to fetch departments')
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
      setError('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  const saveDepartment = async (departmentData: DepartmentFormData) => {
    try {
      setSubmitting(true)
      
      if (departmentData.id) {
        // Update existing department
        const response = await fetch(`/api/departments/${departmentData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(departmentData)
        })

        if (!response.ok) {
          throw new Error('Failed to update department')
        }
      } else {
        // Create new department
        const response = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(departmentData)
        })

        if (!response.ok) {
          throw new Error('Failed to create department')
        }
      }

      setEditingDepartment(null)
      setShowAddDepartment(false)
      
      // Refresh departments list
      await fetchDepartments()
    } catch (err) {
      console.error('Error saving department:', err)
      alert('Failed to save department')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete department')
      }

      // Refresh departments list
      await fetchDepartments()
    } catch (err) {
      console.error('Error deleting department:', err)
      alert('Failed to delete department')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleDepartmentStatus = async (department: Department) => {
    try {
      setSubmitting(true)
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...department,
          is_active: !department.is_active
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update department status')
      }

      // Refresh departments list
      await fetchDepartments()
    } catch (err) {
      console.error('Error updating department status:', err)
      alert('Failed to update department status')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Settings</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Error Loading Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">{error}</p>
              <Button onClick={fetchDepartments} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Settings</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage departments and system configuration
          </p>
        </div>

        {/* Add Department Form */}
        {(showAddDepartment || editingDepartment) && (
          <DepartmentForm
            department={editingDepartment || undefined}
            onSave={saveDepartment}
            onCancel={() => {
              setShowAddDepartment(false)
              setEditingDepartment(null)
            }}
            isSubmitting={submitting}
          />
        )}

        {/* Department Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Management
                </CardTitle>
                <CardDescription>
                  Manage organizational departments that appear in employee forms
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowAddDepartment(true)}
                disabled={submitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No departments found.</p>
                <Button
                  onClick={() => setShowAddDepartment(true)}
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Department
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {departments.map((department) => (
                  <div
                    key={department.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      department.is_active ? 'bg-background' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-lg">{department.name}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            department.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {department.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {department.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {department.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(department.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(department.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleDepartmentStatus(department)}
                        disabled={submitting}
                        title={department.is_active ? 'Deactivate department' : 'Activate department'}
                      >
                        {department.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDepartment(department)}
                        disabled={submitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteDepartment(department.id)}
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Database Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Departments:</span>
                    <span className="font-medium">{departments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Departments:</span>
                    <span className="font-medium">{departments.filter(d => d.is_active).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connection:</span>
                    <span className="text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Application Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform:</span>
                    <span className="font-medium">IXI Survey Platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <span className="font-medium">Production</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}