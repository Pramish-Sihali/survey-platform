// lib/sanitizers/user.ts - User Data Sanitization Functions
import { User, UserWithProfile, SafeUser, SafeUserWithProfile } from '@/lib/types'

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Remove sensitive information (password_hash) from a single user object
 */
export function sanitizeUser(user: UserWithProfile): SafeUserWithProfile {
  const { password_hash, ...sanitizedUser } = user
  return sanitizedUser
}

/**
 * Remove sensitive information from an array of user objects
 */
export function sanitizeUsers(users: UserWithProfile[]): SafeUserWithProfile[] {
  return users.map(user => sanitizeUser(user))
}

/**
 * Remove sensitive information from a basic User object
 */
export function sanitizeBasicUser(user: User): SafeUser {
  const { password_hash, ...sanitizedUser } = user
  return sanitizedUser
}

/**
 * Remove sensitive information from an array of basic User objects
 */
export function sanitizeBasicUsers(users: User[]): SafeUser[] {
  return users.map(user => sanitizeBasicUser(user))
}

/**
 * Sanitize user data for public API responses
 */
export function sanitizeUserForPublic(user: UserWithProfile): Partial<SafeUserWithProfile> {
  const sanitized = sanitizeUser(user)
  
  // Remove additional sensitive fields for public responses
  const { 
    created_by,
    last_login,
    phone,
    bio,
    hire_date,
    supervisor_name,
    reports_to,
    ...publicUser 
  } = sanitized
  
  return publicUser
}

/**
 * Sanitize user data for same-company visibility
 */
export function sanitizeUserForCompany(user: UserWithProfile): SafeUserWithProfile {
  const sanitized = sanitizeUser(user)
  
  // Keep professional information but remove personal details
  return {
    ...sanitized,
    phone: null, // Remove personal phone
    bio: null,   // Remove personal bio
    hire_date: sanitized.hire_date, // Keep hire date for company users
    last_login: null // Remove last login info
  }
}

/**
 * Sanitize user for profile view (user viewing their own profile)
 */
export function sanitizeUserForSelf(user: UserWithProfile): SafeUserWithProfile {
  // User can see all their own information except password
  return sanitizeUser(user)
}

/**
 * Sanitize user for admin view (admin viewing company users)
 */
export function sanitizeUserForAdmin(user: UserWithProfile): SafeUserWithProfile {
  const sanitized = sanitizeUser(user)
  
  // Admin can see most information but with some restrictions
  return {
    ...sanitized,
    bio: null // Remove personal bio even for admins
  }
}

// ============================================================================
// TYPE GUARDS AND VALIDATION
// ============================================================================

/**
 * Check if a user object has been sanitized (no password_hash)
 */
export function isSanitizedUser(user: any): user is SafeUserWithProfile {
  return user && typeof user === 'object' && !('password_hash' in user)
}

/**
 * Check if a user object contains sensitive data
 */
export function isUnsanitizedUser(user: any): user is UserWithProfile {
  return user && typeof user === 'object' && 'password_hash' in user
}

/**
 * Check if a basic user object has been sanitized
 */
export function isSanitizedBasicUser(user: any): user is SafeUser {
  return user && typeof user === 'object' && !('password_hash' in user) && 'email' in user
}

/**
 * Validate that all users in an array are sanitized
 */
export function areAllUsersSanitized(users: any[]): users is SafeUserWithProfile[] {
  return users.every(user => isSanitizedUser(user))
}

// ============================================================================
// BATCH SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize a mixed object containing users (e.g., API responses)
 */
export function sanitizeObjectWithUsers<T extends Record<string, any>>(
  obj: T,
  userFields: (keyof T)[]
): T {
  const sanitized = { ...obj }
  
  for (const field of userFields) {
    const value = sanitized[field]
    
    if (Array.isArray(value)) {
      // Handle array of users
      sanitized[field] = value.map((item: UserWithProfile) => 
        isUnsanitizedUser(item) ? sanitizeUser(item) : item
      ) as T[typeof field]
    } else if (isUnsanitizedUser(value)) {
      // Handle single user object
      sanitized[field] = sanitizeUser(value) as T[typeof field]
    }
  }
  
  return sanitized
}

/**
 * Deeply sanitize an object that might contain users at any level
 */
export function deepSanitizeUsers<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitizeUsers(item)) as T
  }
  
  if (typeof obj === 'object') {
    // Check if this object is a user that needs sanitization
    if (isUnsanitizedUser(obj)) {
      return sanitizeUser(obj as any) as T
    }
    
    // Recursively sanitize all properties
    const sanitized = {} as T
    for (const [key, value] of Object.entries(obj)) {
      (sanitized as any)[key] = deepSanitizeUsers(value)
    }
    return sanitized
  }
  
  return obj
}

// ============================================================================
// CONTEXT-AWARE SANITIZATION
// ============================================================================

/**
 * Sanitize user based on the viewer's permissions
 */
export function sanitizeUserForViewer(
  user: UserWithProfile,
  viewer: UserWithProfile | SafeUserWithProfile,
  context: 'public' | 'company' | 'admin' | 'self' = 'company'
): SafeUserWithProfile | Partial<SafeUserWithProfile> {
  // If viewing own profile
  if (user.id === viewer.id) {
    return sanitizeUserForSelf(user)
  }
  
  // Context-based sanitization
  switch (context) {
    case 'public':
      return sanitizeUserForPublic(user)
    case 'admin':
      return sanitizeUserForAdmin(user)
    case 'self':
      return sanitizeUserForSelf(user)
    case 'company':
    default:
      return sanitizeUserForCompany(user)
  }
}

/**
 * Batch sanitize users with viewer context
 */
export function sanitizeUsersForViewer(
  users: UserWithProfile[],
  viewer: UserWithProfile | SafeUserWithProfile,
  context: 'public' | 'company' | 'admin' | 'self' = 'company'
): (SafeUserWithProfile | Partial<SafeUserWithProfile>)[] {
  return users.map(user => sanitizeUserForViewer(user, viewer, context))
}

// ============================================================================
// SPECIALIZED SANITIZATION
// ============================================================================

/**
 * Sanitize user for assignment display (minimal info needed)
 */
export function sanitizeUserForAssignment(user: UserWithProfile): Pick<SafeUserWithProfile, 'id' | 'name' | 'email' | 'company_id'> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company_id: user.company_id
  }
}

/**
 * Sanitize user for comment display
 */
export function sanitizeUserForComment(user: UserWithProfile): Pick<SafeUserWithProfile, 'id' | 'name' | 'role' | 'avatar_url'> {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar_url: user.avatar_url || null
  }
}

/**
 * Sanitize user for analytics display
 */
export function sanitizeUserForAnalytics(user: UserWithProfile): Pick<SafeUserWithProfile, 'id' | 'name' | 'designation' | 'department_name'> {
  return {
    id: user.id,
    name: user.name,
    designation: user.designation || null,
    department_name: user.department_name || null
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Safe sanitization that handles malformed user objects
 */
export function safeSanitizeUser(user: unknown): SafeUserWithProfile | null {
  try {
    if (!user || typeof user !== 'object') {
      return null
    }
    
    if (isSanitizedUser(user)) {
      return user
    }
    
    if (isUnsanitizedUser(user)) {
      return sanitizeUser(user)
    }
    
    return null
  } catch (error) {
    console.error('Error sanitizing user:', error)
    return null
  }
}

/**
 * Safe batch sanitization with error handling
 */
export function safeSanitizeUsers(users: unknown[]): SafeUserWithProfile[] {
  if (!Array.isArray(users)) {
    return []
  }
  
  return users
    .map(user => safeSanitizeUser(user))
    .filter((user): user is SafeUserWithProfile => user !== null)
}