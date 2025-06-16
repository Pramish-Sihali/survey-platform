// lib/auth/helpers.ts - Role-Based Helper Functions
import { User, UserWithProfile, SafeUserWithProfile, Survey, UserRole } from '@/lib/types'

// ============================================================================
// ROLE CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin'
}

/**
 * Check if user is a company admin
 */
export function isCompanyAdmin(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'company_admin'
}

/**
 * Check if user is a regular company user
 */
export function isCompanyUser(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'company_user'
}

/**
 * Check if user has admin access (super admin or company admin)
 */
export function hasAdminAccess(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin' || user.role === 'company_admin'
}

/**
 * Check if user has super admin privileges
 */
export function hasSuperAdminAccess(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin'
}

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user can manage a specific company
 */
export function canManageCompany(user: User | UserWithProfile | SafeUserWithProfile, companyId: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && user.company_id === companyId) return true
  return false
}

/**
 * Check if user can access a specific survey
 */
export function canAccessSurvey(user: User | UserWithProfile | SafeUserWithProfile, survey: Survey): boolean {
  if (user.role === 'super_admin') return true
  return user.company_id === survey.company_id
}

/**
 * Check if user can manage surveys in a company
 */
export function canManageSurveys(user: User | UserWithProfile | SafeUserWithProfile, companyId: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && user.company_id === companyId) return true
  return false
}

/**
 * Check if user can manage users in a company
 */
export function canManageUsers(user: User | UserWithProfile | SafeUserWithProfile, companyId: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && user.company_id === companyId) return true
  return false
}

/**
 * Check if user can view users in a company
 */
export function canViewUsers(user: User | UserWithProfile | SafeUserWithProfile, companyId: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.company_id === companyId) return true
  return false
}

/**
 * Check if user can manage survey assignments
 */
export function canManageAssignments(user: User | UserWithProfile | SafeUserWithProfile, companyId?: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && companyId && user.company_id === companyId) return true
  return false
}

/**
 * Check if user can view survey assignments
 */
export function canViewAssignments(user: User | UserWithProfile | SafeUserWithProfile, companyId?: string, userId?: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && companyId && user.company_id === companyId) return true
  if (user.role === 'company_user' && userId && user.id === userId) return true
  return false
}

/**
 * Check if user can create comments
 */
export function canCreateComments(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  // All authenticated users can create comments
  return true
}

/**
 * Check if user can manage comments (edit/delete)
 */
export function canManageComments(user: User | UserWithProfile | SafeUserWithProfile, commentUserId: string, companyId?: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && companyId && user.company_id === companyId) return true
  if (user.id === commentUserId) return true // Own comments
  return false
}

// ============================================================================
// COMPANY ISOLATION HELPERS
// ============================================================================

/**
 * Get the company ID that a user can access (for data filtering)
 */
export function getAccessibleCompanyId(user: User | UserWithProfile | SafeUserWithProfile, requestedCompanyId?: string): string | null {
  if (user.role === 'super_admin') {
    // Super admin can access any company
    return requestedCompanyId || null
  }
  
  // Other roles can only access their own company
  return user.company_id
}

/**
 * Check if user has access to multi-company data
 */
export function hasMultiCompanyAccess(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin'
}

/**
 * Get effective company filter for queries
 */
export function getCompanyFilter(user: User | UserWithProfile | SafeUserWithProfile, requestedCompanyId?: string): { company_id?: string } {
  if (user.role === 'super_admin') {
    return requestedCompanyId ? { company_id: requestedCompanyId } : {}
  }
  
  return { company_id: user.company_id || '' }
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Get the default dashboard route for a user based on their role
 */
export function getDefaultDashboardRoute(user: User | UserWithProfile | SafeUserWithProfile): string {
  switch (user.role) {
    case 'super_admin':
      return '/super-admin'
    case 'company_admin':
      return '/admin'
    case 'company_user':
      return '/user'
    default:
      return '/login'
  }
}

/**
 * Get accessible routes for a user based on their role
 */
export function getAccessibleRoutes(user: User | UserWithProfile | SafeUserWithProfile): string[] {
  const commonRoutes = ['/profile', '/logout']
  
  switch (user.role) {
    case 'super_admin':
      return [
        '/super-admin',
        '/super-admin/companies',
        '/super-admin/analytics',
        ...commonRoutes
      ]
    case 'company_admin':
      return [
        '/admin',
        '/admin/users',
        '/admin/surveys',
        '/admin/assignments',
        '/admin/analytics',
        ...commonRoutes
      ]
    case 'company_user':
      return [
        '/user',
        '/user/surveys',
        '/user/profile',
        ...commonRoutes
      ]
    default:
      return []
  }
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(user: User | UserWithProfile | SafeUserWithProfile, route: string): boolean {
  const accessibleRoutes = getAccessibleRoutes(user)
  return accessibleRoutes.some(accessibleRoute => route.startsWith(accessibleRoute))
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Check if user can access advanced analytics
 */
export function canAccessAdvancedAnalytics(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin' || user.role === 'company_admin'
}

/**
 * Check if user can export data
 */
export function canExportData(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin' || user.role === 'company_admin'
}

/**
 * Check if user can bulk import users
 */
export function canBulkImportUsers(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin' || user.role === 'company_admin'
}

/**
 * Check if user can access API documentation
 */
export function canAccessApiDocs(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin'
}

// ============================================================================
// ROLE HIERARCHY HELPERS
// ============================================================================

/**
 * Check if user can assign a specific role to another user
 */
export function canAssignRole(user: User | UserWithProfile | SafeUserWithProfile, targetRole: UserRole): boolean {
  if (user.role === 'super_admin') {
    // Super admin can assign any role
    return true
  }
  
  if (user.role === 'company_admin') {
    // Company admin can only assign company_user role
    return targetRole === 'company_user'
  }
  
  // Regular users cannot assign roles
  return false
}

/**
 * Get roles that a user can assign to others
 */
export function getAssignableRoles(user: User | UserWithProfile | SafeUserWithProfile): UserRole[] {
  switch (user.role) {
    case 'super_admin':
      return ['super_admin', 'company_admin', 'company_user']
    case 'company_admin':
      return ['company_user']
    default:
      return []
  }
}

/**
 * Check if user can modify another user's role
 */
export function canModifyUserRole(user: User | UserWithProfile | SafeUserWithProfile, targetUser: User | UserWithProfile | SafeUserWithProfile): boolean {
  if (user.role === 'super_admin') {
    // Super admin can modify anyone's role
    return true
  }
  
  if (user.role === 'company_admin') {
    // Company admin can modify users in their company (except super admins)
    return user.company_id === targetUser.company_id && targetUser.role !== 'super_admin'
  }
  
  return false
}