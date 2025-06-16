// lib/index.ts - Convenience Re-exports
// ============================================================================
// CORE UTILITIES
// ============================================================================

export * from './utils'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export * from './types'

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export * from './auths/helpers'

// ============================================================================
// USER SANITIZATION
// ============================================================================

export * from './sanitizers/user'

// ============================================================================
// API CLIENT
// ============================================================================

export { ApiClient } from './api/client'

// ============================================================================
// CONVENIENCE EXPORTS (Most commonly used)
// ============================================================================

// Core utility
export { cn } from './utils'

// Common types
export type {
  User,
  UserWithProfile,
  SafeUserWithProfile,
  Company,
  Survey,
  SurveyAssignment,
  UserRole,
  AssignmentStatus,
  CommentType
} from './types'

// Common auth helpers
export {
  isSuperAdmin,
  isCompanyAdmin,
  hasAdminAccess,
  canManageCompany,
  getDefaultDashboardRoute
} from './auths/helpers'

// Common sanitization
export {
  sanitizeUser,
  sanitizeUsers,
  isSanitizedUser
} from './sanitizers/user'