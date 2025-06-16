'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { SafeUserWithProfile } from '@/lib/types'
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout'
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Bell,
  Save,
  AlertTriangle,
  CheckCircle,
  Key,
  Globe,
  Users,
  Building2,
  BarChart3,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface PlatformSettings {
  general: {
    platformName: string
    supportEmail: string
    maxCompanies: number
    defaultUserLimit: number
    defaultSurveyLimit: number
    maintenanceMode: boolean
  }
  subscriptions: {
    basic: {
      name: string
      maxUsers: number
      maxSurveys: number
      price: number
    }
    professional: {
      name: string
      maxUsers: number
      maxSurveys: number
      price: number
    }
    premium: {
      name: string
      maxUsers: number
      maxSurveys: number
      price: number
    }
    enterprise: {
      name: string
      maxUsers: number
      maxSurveys: number
      price: number
    }
  }
  security: {
    enforcePasswordComplexity: boolean
    sessionTimeoutMinutes: number
    maxLoginAttempts: number
    requireEmailVerification: boolean
    enableTwoFactor: boolean
  }
  notifications: {
    enableEmailNotifications: boolean
    enableSMSNotifications: boolean
    dailyReports: boolean
    weeklyReports: boolean
    monthlyReports: boolean
  }
}

export default function SuperAdminSettingsPage() {
  const [user, setUser] = useState<SafeUserWithProfile | null>(null)
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platformName: 'Survey Platform',
      supportEmail: 'support@surveyplatform.com',
      maxCompanies: 1000,
      defaultUserLimit: 50,
      defaultSurveyLimit: 10,
      maintenanceMode: false
    },
    subscriptions: {
      basic: { name: 'Basic', maxUsers: 50, maxSurveys: 10, price: 29 },
      professional: { name: 'Professional', maxUsers: 100, maxSurveys: 25, price: 99 },
      premium: { name: 'Premium', maxUsers: 200, maxSurveys: 50, price: 199 },
      enterprise: { name: 'Enterprise', maxUsers: 500, maxSurveys: 100, price: 499 }
    },
    security: {
      enforcePasswordComplexity: true,
      sessionTimeoutMinutes: 480,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      enableTwoFactor: false
    },
    notifications: {
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      dailyReports: false,
      weeklyReports: true,
      monthlyReports: true
    }
  })
  const [activeTab, setActiveTab] = useState<'general' | 'subscriptions' | 'security' | 'notifications' | 'data'>('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
      
      // In a real implementation, you'd load settings from an API
      // For now, we'll use the default settings
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      // In a real implementation, you'd save to an API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // In a real implementation, you'd call an export API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate export
      
      // Create a dummy download
      const blob = new Blob(['Platform data export...'], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const updateSettings = (section: keyof PlatformSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const updateSubscriptionPlan = (plan: keyof PlatformSettings['subscriptions'], key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      subscriptions: {
        ...prev.subscriptions,
        [plan]: {
          ...prev.subscriptions[plan],
          [key]: value
        }
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Error loading user</div>
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'subscriptions', name: 'Subscription Plans', icon: Building2 },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database }
  ]

  return (
    <SuperAdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600 mt-2">Configure platform-wide settings and preferences</p>
          </div>
          
          <div className="flex items-center gap-2">
            {saveMessage && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                saveMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {saveMessage.includes('successfully') ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {saveMessage}
              </div>
            )}
            
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">General Platform Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => updateSettings('general', 'platformName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Companies
                    </label>
                    <input
                      type="number"
                      value={settings.general.maxCompanies}
                      onChange={(e) => updateSettings('general', 'maxCompanies', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default User Limit
                    </label>
                    <input
                      type="number"
                      value={settings.general.defaultUserLimit}
                      onChange={(e) => updateSettings('general', 'defaultUserLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Survey Limit
                    </label>
                    <input
                      type="number"
                      value={settings.general.defaultSurveyLimit}
                      onChange={(e) => updateSettings('general', 'defaultSurveyLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => updateSettings('general', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                    Enable Maintenance Mode (blocks access for all non-admin users)
                  </label>
                </div>
              </div>
            )}

            {/* Subscription Plans */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Plan Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(settings.subscriptions).map(([planKey, plan]) => (
                    <div key={planKey} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4 capitalize">{planKey} Plan</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan Name
                          </label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => updateSubscriptionPlan(planKey as any, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Users
                          </label>
                          <input
                            type="number"
                            value={plan.maxUsers}
                            onChange={(e) => updateSubscriptionPlan(planKey as any, 'maxUsers', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Surveys
                          </label>
                          <input
                            type="number"
                            value={plan.maxSurveys}
                            onChange={(e) => updateSubscriptionPlan(planKey as any, 'maxSurveys', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Price ($)
                          </label>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => updateSubscriptionPlan(planKey as any, 'price', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="passwordComplexity"
                      checked={settings.security.enforcePasswordComplexity}
                      onChange={(e) => updateSettings('security', 'enforcePasswordComplexity', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="passwordComplexity" className="ml-2 block text-sm text-gray-700">
                      Enforce password complexity requirements
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailVerification"
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => updateSettings('security', 'requireEmailVerification', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailVerification" className="ml-2 block text-sm text-gray-700">
                      Require email verification for new accounts
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="twoFactor"
                      checked={settings.security.enableTwoFactor}
                      onChange={(e) => updateSettings('security', 'enableTwoFactor', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-700">
                      Enable two-factor authentication
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => updateSettings('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.enableEmailNotifications}
                      onChange={(e) => updateSettings('notifications', 'enableEmailNotifications', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                      Enable email notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={settings.notifications.enableSMSNotifications}
                      onChange={(e) => updateSettings('notifications', 'enableSMSNotifications', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                      Enable SMS notifications
                    </label>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Automated Reports</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="dailyReports"
                          checked={settings.notifications.dailyReports}
                          onChange={(e) => updateSettings('notifications', 'dailyReports', e.target.checked)}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <label htmlFor="dailyReports" className="ml-2 block text-sm text-gray-700">
                          Daily platform reports
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weeklyReports"
                          checked={settings.notifications.weeklyReports}
                          onChange={(e) => updateSettings('notifications', 'weeklyReports', e.target.checked)}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-700">
                          Weekly analytics reports
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="monthlyReports"
                          checked={settings.notifications.monthlyReports}
                          onChange={(e) => updateSettings('notifications', 'monthlyReports', e.target.checked)}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <label htmlFor="monthlyReports" className="ml-2 block text-sm text-gray-700">
                          Monthly business reports
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export Data
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Export all platform data including companies, users, surveys, and responses.
                    </p>
                    <button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {isExporting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export All Data'}
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      System Maintenance
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Run system maintenance tasks and cleanup operations.
                    </p>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <RefreshCw className="h-4 w-4" />
                      Run Maintenance
                    </button>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </h4>
                    <p className="text-sm text-red-600 mb-4">
                      Permanently delete inactive companies and their data.
                    </p>
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      Cleanup Inactive Data
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Database Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">~50,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Database Size:</span>
                        <span className="font-medium">1.2 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Backup:</span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}