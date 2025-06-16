// app/api/super-admin/settings/route.ts - Platform Settings API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAuthenticatedUser(request: NextRequest): any {
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role') as UserRole
  const companyId = request.headers.get('x-company-id')

  // TEMPORARY: For testing when headers are not set
  if (!userId || !userRole) {
    return { 
      id: 'test-super-admin', 
      role: 'super_admin' as UserRole, 
      company_id: null 
    }
  }

  return {
    id: userId,
    role: userRole,
    company_id: companyId
  }
}

async function getStoredSettings(): Promise<PlatformSettings> {
  try {
    // Try to get settings from database
    const { data: settingsData, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    if (error || !settingsData) {
      // Return default settings if none found
      return getDefaultSettings()
    }

    return settingsData.settings
  } catch (error) {
    console.error('Error fetching stored settings:', error)
    return getDefaultSettings()
  }
}

function getDefaultSettings(): PlatformSettings {
  return {
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
  }
}

async function saveSettings(settings: PlatformSettings, updatedBy: string): Promise<boolean> {
  try {
    // First, check if settings record exists
    const { data: existingSettings } = await supabase
      .from('platform_settings')
      .select('id')
      .single()

    const settingsData = {
      settings,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    }

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('platform_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)

      if (error) {
        console.error('Error updating settings:', error)
        return false
      }
    } else {
      // Create new settings record
      const { error } = await supabase
        .from('platform_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating settings:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}



export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)

    // Only super admins can access platform settings
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const settings = await getStoredSettings()

    return NextResponse.json({
      settings,
      metadata: {
        retrieved_at: new Date().toISOString(),
        retrieved_by: authenticatedUser.id
      }
    })

  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform settings' },
      { status: 500 }
    )
  }
}

// ============================================================================
// UPDATE SETTINGS
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body = await request.json()

    // Only super admins can update platform settings
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const { settings } = body

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      )
    }

    // Get current settings and merge with updates
    const currentSettings = await getStoredSettings()
    const updatedSettings: PlatformSettings = {
      general: { ...currentSettings.general, ...(settings.general || {}) },
      subscriptions: { 
        ...currentSettings.subscriptions, 
        ...(settings.subscriptions || {})
      },
      security: { ...currentSettings.security, ...(settings.security || {}) },
      notifications: { ...currentSettings.notifications, ...(settings.notifications || {}) }
    }

    // Validate specific settings
    if (updatedSettings.general.maxCompanies < 1) {
      return NextResponse.json(
        { error: 'Max companies must be at least 1' },
        { status: 400 }
      )
    }

    if (updatedSettings.general.defaultUserLimit < 1) {
      return NextResponse.json(
        { error: 'Default user limit must be at least 1' },
        { status: 400 }
      )
    }

    if (updatedSettings.general.defaultSurveyLimit < 1) {
      return NextResponse.json(
        { error: 'Default survey limit must be at least 1' },
        { status: 400 }
      )
    }

    if (updatedSettings.security.sessionTimeoutMinutes < 5 || updatedSettings.security.sessionTimeoutMinutes > 43200) {
      return NextResponse.json(
        { error: 'Session timeout must be between 5 minutes and 30 days' },
        { status: 400 }
      )
    }

    if (updatedSettings.security.maxLoginAttempts < 1 || updatedSettings.security.maxLoginAttempts > 20) {
      return NextResponse.json(
        { error: 'Max login attempts must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Validate subscription plans
    const subscriptionPlans = ['basic', 'professional', 'premium', 'enterprise']
    for (const planKey of subscriptionPlans) {
      const plan = updatedSettings.subscriptions[planKey as keyof typeof updatedSettings.subscriptions]
      if (plan.maxUsers < 1) {
        return NextResponse.json(
          { error: `${planKey} plan max users must be at least 1` },
          { status: 400 }
        )
      }
      if (plan.maxSurveys < 1) {
        return NextResponse.json(
          { error: `${planKey} plan max surveys must be at least 1` },
          { status: 400 }
        )
      }
      if (plan.price < 0) {
        return NextResponse.json(
          { error: `${planKey} plan price cannot be negative` },
          { status: 400 }
        )
      }
    }

    // Save settings
    const saved = await saveSettings(updatedSettings, authenticatedUser.id)

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      )
    }

    console.log('Platform settings updated by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
      updated_by: authenticatedUser.id
    })

  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update platform settings' },
      { status: 500 }
    )
  }
}

// ============================================================================
// RESET TO DEFAULTS
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)

    // Only super admins can reset platform settings
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const defaultSettings = getDefaultSettings()
    const saved = await saveSettings(defaultSettings, authenticatedUser.id)

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to reset settings' },
        { status: 500 }
      )
    }

    console.log('Platform settings reset to defaults by:', authenticatedUser.id)

    return NextResponse.json({
      message: 'Settings reset to defaults successfully',
      settings: defaultSettings,
      reset_at: new Date().toISOString(),
      reset_by: authenticatedUser.id
    })

  } catch (error) {
    console.error('Reset settings error:', error)
    return NextResponse.json(
      { error: 'Failed to reset platform settings' },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXPORT SETTINGS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = getAuthenticatedUser(request)
    const body = await request.json()

    // Only super admins can export platform settings
    if (authenticatedUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Super admin access required.' },
        { status: 403 }
      )
    }

    const { action } = body

    if (action === 'export') {
      const settings = await getStoredSettings()
      
      const exportData = {
        settings,
        exported_at: new Date().toISOString(),
        exported_by: authenticatedUser.id,
        version: '1.0',
        platform: 'Survey Platform'
      }

      return NextResponse.json({
        data: exportData,
        filename: `platform-settings-${new Date().toISOString().split('T')[0]}.json`
      })
    }

    if (action === 'import') {
      const { importData } = body
      
      if (!importData || !importData.settings) {
        return NextResponse.json(
          { error: 'Invalid import data format' },
          { status: 400 }
        )
      }

      // Validate imported settings have the correct structure
      const requiredSections = ['general', 'subscriptions', 'security', 'notifications']
      for (const section of requiredSections) {
        if (!importData.settings[section]) {
          return NextResponse.json(
            { error: `Missing required section: ${section}` },
            { status: 400 }
          )
        }
      }

      const saved = await saveSettings(importData.settings, authenticatedUser.id)

      if (!saved) {
        return NextResponse.json(
          { error: 'Failed to import settings' },
          { status: 500 }
        )
      }

      console.log('Platform settings imported by:', authenticatedUser.id)

      return NextResponse.json({
        message: 'Settings imported successfully',
        imported_at: new Date().toISOString(),
        imported_by: authenticatedUser.id
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "export" or "import"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Settings export/import error:', error)
    return NextResponse.json(
      { error: 'Failed to process settings operation' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json({
    message: 'Super Admin Settings endpoint is active',
    methods: ['GET', 'PUT', 'DELETE', 'POST'],
    timestamp: new Date().toISOString()
  })
}