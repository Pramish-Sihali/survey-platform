// lib/utils.ts - Core Utilities (Simplified)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Survey, FormStep, FormQuestion, FormResponses, FormResponseValue } from '@/lib/types'

// ============================================================================
// CORE TAILWIND UTILITY
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format date string to locale date
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

/**
 * Format date string to locale date and time
 */
export function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string): string {
  try {
    return new Date(dateString).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  } catch {
    return dateString
  }
}

/**
 * Check if a date is within a specified range
 */
export function isDateInRange(startDate: string | null, endDate: string | null): boolean {
  if (!startDate && !endDate) return true
  
  const now = new Date()
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  
  if (start && now < start) return false
  if (end && now > end) return false
  
  return true
}

/**
 * Check if a date is in the past
 */
export function isDatePast(dateString: string): boolean {
  try {
    return new Date(dateString) < new Date()
  } catch {
    return false
  }
}

/**
 * Check if a date is in the future
 */
export function isDateFuture(dateString: string): boolean {
  try {
    return new Date(dateString) > new Date()
  } catch {
    return false
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as T
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}
/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// ============================================================================
// FORM CONVERSION UTILITIES (for backward compatibility)
// ============================================================================

/**
 * Convert Survey to legacy FormSteps format
 */
export function convertSurveyToFormSteps(survey: Survey): FormStep[] {
  if (!survey.survey_sections) return []
  
  return survey.survey_sections
    .sort((a, b) => a.order_index - b.order_index)
    .map(section => ({
      id: section.id,
      title: section.title,
      questions: (section.questions || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(question => ({
          id: question.id,
          type: question.question_type as FormQuestion['type'],
          question: question.question_text,
          required: question.is_required,
          options: question.question_options
            ?.sort((a, b) => a.order_index - b.order_index)
            .map(opt => opt.option_text),
          hasOther: question.has_other_option,
          section: section.title
        }))
    }))
}

/**
 * Convert form responses to API format
 */
export function convertFormResponseToApiFormat(
  surveyId: string,
  userId: string,
  assignmentId: string | null,
  responses: FormResponses,
  completionTimeMinutes?: number,
  isRefill: boolean = false,
  responseAttempt: number = 1
) {
  return {
    survey_id: surveyId,
    user_id: userId,
    assignment_id: assignmentId,
    responses,
    completion_time_minutes: completionTimeMinutes,
    is_refill: isRefill,
    response_attempt: responseAttempt
  }
}

/**
 * Validate form response value
 */
export function validateFormResponse(value: FormResponseValue, required: boolean): boolean {
  if (!required && (value === null || value === undefined || value === '')) {
    return true
  }
  
  if (required && (value === null || value === undefined || value === '')) {
    return false
  }
  
  if (Array.isArray(value)) {
    return value.length > 0
  }
  
  if (typeof value === 'object' && value !== null) {
    return 'main' in value && value.main !== null && value.main !== undefined && value.main !== ''
  }
  
  return true
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unknown error occurred'
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safely get item from localStorage
 */
export function getLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely set item in localStorage
 */
export function setLocalStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeLocalStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// ============================================================================
// FOCUS UTILITIES
// ============================================================================

/**
 * Focus first input in container
 */
export function focusFirstInput(container: HTMLElement): void {
  const firstInput = container.querySelector('input, textarea, select') as HTMLElement
  if (firstInput) {
    firstInput.focus()
  }
}

/**
 * Trap focus within container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}