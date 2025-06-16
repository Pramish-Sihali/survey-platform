// lib/utils.ts - Multi-Tenant B2B Survey Platform (UPDATED WITH SANITIZED TYPES)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// MULTI-TENANT DATABASE TYPES
// ============================================================================

// Company Types
export interface Company {
  id: string
  name: string
  domain: string | null
  subscription_plan: string
  is_active: boolean
  max_users: number
  max_surveys: number
  created_at: string
  updated_at: string
}

export interface CompanyWithStats extends Company {
  user_count?: number
  survey_count?: number
  active_assignments?: number
  admin_count?: number
}

// User Types
export type UserRole = 'super_admin' | 'company_admin' | 'company_user'

export interface User {
  id: string
  company_id: string | null
  email: string
  password_hash: string
  name: string
  role: UserRole
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface UserProfile {
  id: string
  user_id: string
  designation: string | null
  department_id: string | null
  supervisor_name: string | null
  reports_to: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  hire_date: string | null
  is_profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface UserWithProfile extends User {
  company_name?: string | null
  designation?: string | null
  department_id?: string | null
  supervisor_name?: string | null
  reports_to?: string | null
  phone?: string | null
  avatar_url?: string | null
  bio?: string | null
  hire_date?: string | null
  is_profile_complete?: boolean
  department_name?: string | null
}

// ============================================================================
// SANITIZED USER TYPES FOR API RESPONSES
// ============================================================================

// Sanitized user type without sensitive information (password_hash removed)
export interface SafeUserWithProfile extends Omit<UserWithProfile, 'password_hash'> {
  // All properties from UserWithProfile except password_hash
}

// Safe User type without password_hash
export interface SafeUser extends Omit<User, 'password_hash'> {
  // All properties from User except password_hash
}

// Department Types (updated for multi-tenancy)
export interface Department {
  id: string
  company_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DepartmentWithCompany extends Department {
  company?: Company
  user_count?: number
}

// Survey Types (updated for multi-tenancy)
export interface Survey {
  id: string
  company_id: string
  created_by: string | null
  title: string
  description: string | null
  is_active: boolean
  is_published: boolean
  allows_refill: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  survey_sections?: SurveySection[]
}

export interface SurveySection {
  id: string
  survey_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
  updated_at: string
  questions?: Question[]
}

export interface Question {
  id: string
  section_id: string
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
  order_index: number
  metadata?: any
  created_at: string
  updated_at: string
  question_options?: QuestionOption[]
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  order_index: number
  created_at: string
}

// Survey Assignment Types
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'refill_requested'

export interface SurveyAssignment {
  id: string
  survey_id: string
  user_id: string
  assigned_by: string
  status: AssignmentStatus
  assigned_at: string
  completed_at: string | null
  due_date: string | null
  refill_count: number
  notes: string | null
}

// FIXED: Added nested objects that Supabase returns
export interface SurveyAssignmentWithDetails extends SurveyAssignment {
  // Nested Supabase relationship objects
  surveys?: {
    id: string
    title: string
    description?: string
    company_id: string
    is_active: boolean
    is_published: boolean
    allows_refill?: boolean
    start_date?: string
    end_date?: string
  }
  users?: {
    id: string
    name: string
    email: string
    company_id: string
  }
  assigned_by_user?: {
    id: string
    name: string
    email: string
  }
  
  // Flattened convenience properties
  survey_title: string
  survey_description: string | null
  user_name: string
  user_email: string
  assigned_by_name: string
  company_name: string
}

// Survey Response Types (updated)
export interface SurveyResponse {
  id: string
  survey_id: string
  user_id: string | null
  assignment_id: string | null
  response_attempt: number
  is_refill: boolean
  submitted_at: string
  completion_time_minutes: number | null
}

export interface QuestionResponse {
  id: string
  survey_response_id: string
  question_id: string
  response_type: 'text' | 'number' | 'array' | 'object'
  text_response: string | null
  number_response: number | null
  array_response: string[] | null
  object_response: any | null
  created_at: string
}

// Comment Types
export type CommentType = 'general' | 'clarification' | 'feedback' | 'refill_request'

export interface SurveyComment {
  id: string
  survey_id: string
  assignment_id: string | null
  user_id: string
  recipient_id: string | null
  comment_text: string
  comment_type: CommentType
  is_read: boolean
  parent_comment_id: string | null
  created_at: string
  updated_at: string
}

export interface CommentWithUser extends SurveyComment {
  user: User
  recipient?: User
  replies?: CommentWithUser[]
}

// ============================================================================
// LEGACY FORM TYPES (for compatibility)
// ============================================================================

export interface FormStep {
  id: string
  title: string
  questions: FormQuestion[]
}

export interface FormQuestion {
  id: string
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating' | 'yes_no'
  question: string
  required: boolean
  options?: string[]
  hasOther?: boolean
  section?: string
}

export interface EmployeeInfo {
  name: string
  designation: string
  department: string
  supervisor: string
  reportsTo: string
}

export type FormResponseValue = 
  | string 
  | number 
  | string[] 
  | { main: string | number; other?: string }

export type FormResponses = Record<string, FormResponseValue>

// ============================================================================
// UPDATED API RESPONSE TYPES (WITH SANITIZED USERS)
// ============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// User Management API Responses (UPDATED)
export interface UsersResponse {
  users: SafeUserWithProfile[]  // CHANGED: Now uses sanitized type
  total?: number
}

export interface UserDetailResponse {
  user: SafeUserWithProfile  // CHANGED: Now uses sanitized type
}

// Company Management API Responses
export interface CompaniesResponse {
  companies: CompanyWithStats[]
  total?: number
}

export interface CompanyDetailResponse {
  company: CompanyWithStats
}

// Survey API Responses
export interface SurveyListResponse {
  surveys: Survey[]
  total?: number
}

export interface SurveyDetailResponse {
  survey: Survey
}

// Assignment API Responses
export interface AssignmentsResponse {
  assignments: SurveyAssignmentWithDetails[]
  total?: number
}

// Comments API Responses
export interface CommentsResponse {
  comments: CommentWithUser[]
  total?: number
}

// Analytics Types
export interface QuestionAnalytics {
  id: string
  question: string
  type: string
  responses: number
  avgRating?: number
  distribution?: number[]
  yesCount?: number
  noCount?: number
}

export interface AnalyticsResponse {
  overview: {
    totalResponses: number
    responseRate: number
    avgCompletionTime: number
    lastUpdated: string
  }
  departments: Array<{
    name: string
    responses: number
    total: number
    rate: number
  }>
  questionAnalytics: QuestionAnalytics[]
}

// ============================================================================
// USER SANITIZATION UTILITY FUNCTIONS
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
  return user && typeof user === 'object' && !('password_hash' in user)
}

// ============================================================================
// ROLE-BASED HELPER FUNCTIONS
// ============================================================================

// Role-based helper functions
export function isSuperAdmin(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin'
}

export function isCompanyAdmin(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'company_admin'
}

export function isCompanyUser(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'company_user'
}

export function hasAdminAccess(user: User | UserWithProfile | SafeUserWithProfile): boolean {
  return user.role === 'super_admin' || user.role === 'company_admin'
}

export function canManageCompany(user: User | UserWithProfile | SafeUserWithProfile, companyId: string): boolean {
  if (user.role === 'super_admin') return true
  if (user.role === 'company_admin' && user.company_id === companyId) return true
  return false
}

export function canAccessSurvey(user: User | UserWithProfile | SafeUserWithProfile, survey: Survey): boolean {
  if (user.role === 'super_admin') return true
  return user.company_id === survey.company_id
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

// Date utilities
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function isDateInRange(startDate: string | null, endDate: string | null): boolean {
  if (!startDate && !endDate) return true
  
  const now = new Date()
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  
  if (start && now < start) return false
  if (end && now > end) return false
  
  return true
}

// ============================================================================
// FORM CONVERSION UTILITIES
// ============================================================================

// Form conversion utilities (for backward compatibility)
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
          hasOther: question.has_other_option
        }))
    }))
}

export function convertFormResponseToApiFormat(
  surveyId: string,
  userId: string,
  assignmentId: string,
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

// ============================================================================
// MULTI-TENANT API CLIENT
// ============================================================================

export class ApiClient {
  private static baseUrl = '/api'
  private static authToken: string | null = null

  // Set authentication token
  static setAuthToken(token: string) {
    this.authToken = token
  }

  static clearAuthToken() {
    this.authToken = null
  }

  // Base request method with auth
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  // Convenience methods
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  static async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  static async login(email: string, password: string): Promise<{ user: SafeUserWithProfile; token: string }> {
    return this.post('/auth/login', { email, password })
  }

  static async logout(): Promise<ApiResponse<any>> {
    const result = await this.post<ApiResponse<any>>('/auth/logout', {})
    this.clearAuthToken()
    return result
  }

  static async getCurrentUser(): Promise<UserDetailResponse> {
    return this.get('/auth/logout') // This should be '/auth/me' but using logout endpoint for now
  }

  // ============================================================================
  // COMPANY MANAGEMENT (Super Admin)
  // ============================================================================

  static async getCompanies(): Promise<CompaniesResponse> {
    return this.get('/companies')
  }

  static async getCompany(id: string): Promise<CompanyDetailResponse> {
    return this.get(`/companies/${id}`)
  }

  static async createCompany(data: Partial<Company>): Promise<{ company: Company }> {
    return this.post('/companies', data)
  }

  static async updateCompany(id: string, data: Partial<Company>): Promise<{ company: Company }> {
    return this.put(`/companies/${id}`, data)
  }

  static async deleteCompany(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/companies/${id}`)
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  static async getUsers(companyId?: string): Promise<UsersResponse> {
    const endpoint = companyId ? `/users?company_id=${companyId}` : '/users'
    return this.get(endpoint)
  }

  static async getUser(id: string): Promise<UserDetailResponse> {
    return this.get(`/users/${id}`)
  }

  static async createUser(data: Partial<User> & { profile?: Partial<UserProfile> }): Promise<{ user: SafeUserWithProfile }> {
    return this.post('/users', data)
  }

  static async updateUser(id: string, data: Partial<User>): Promise<{ user: SafeUserWithProfile }> {
    return this.put(`/users/${id}`, data)
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    return this.put(`/users/${userId}/profile`, data)
  }

  static async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/users/${id}`)
  }

  static async inviteUser(email: string, name: string, role: UserRole, companyId: string): Promise<{ user: SafeUserWithProfile }> {
    return this.post('/users/invite', { email, name, role, company_id: companyId })
  }

  // ============================================================================
  // DEPARTMENT METHODS (Company-specific)
  // ============================================================================

  static async getDepartments(companyId?: string): Promise<{ departments: Department[] }> {
    const endpoint = companyId ? `/departments?company_id=${companyId}` : '/departments'
    return this.get(endpoint)
  }

  static async createDepartment(data: Partial<Department>): Promise<{ department: Department }> {
    return this.post('/departments', data)
  }

  static async updateDepartment(id: string, data: Partial<Department>): Promise<{ department: Department }> {
    return this.put(`/departments/${id}`, data)
  }

  static async deleteDepartment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/departments/${id}`)
  }

  // ============================================================================
  // SURVEY METHODS (Company-specific)
  // ============================================================================

  static async getSurveys(companyId?: string): Promise<SurveyListResponse> {
    const endpoint = companyId ? `/surveys?company_id=${companyId}` : '/surveys'
    return this.get(endpoint)
  }

  static async getSurvey(id: string): Promise<SurveyDetailResponse> {
    return this.get(`/surveys/${id}`)
  }

  static async createSurvey(data: Partial<Survey>): Promise<{ survey: Survey }> {
    return this.post('/surveys', data)
  }

  static async updateSurvey(id: string, data: Partial<Survey>): Promise<{ survey: Survey }> {
    return this.put(`/surveys/${id}`, data)
  }

  static async deleteSurvey(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/surveys/${id}`)
  }

  // ============================================================================
  // SURVEY ASSIGNMENT METHODS
  // ============================================================================

  static async getAssignments(filters?: {
    user_id?: string
    survey_id?: string
    status?: AssignmentStatus
    company_id?: string
  }): Promise<AssignmentsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const endpoint = `/survey-assignments${params.toString() ? `?${params.toString()}` : ''}`
    return this.get(endpoint)
  }

  static async createAssignment(data: {
    survey_id: string
    user_ids: string[]
    notes?: string
    due_date?: string
  }): Promise<{ assignments: SurveyAssignment[]; count: number }> {
    return this.post('/survey-assignments', data)
  }

  static async updateAssignment(id: string, data: Partial<SurveyAssignment>): Promise<{ assignment: SurveyAssignment }> {
    return this.put(`/survey-assignments/${id}`, data)
  }

  static async deleteAssignment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/survey-assignments/${id}`)
  }

  static async requestRefillFromAssignment(assignmentId: string, reason?: string): Promise<{ assignment: SurveyAssignment }> {
    return this.patch(`/survey-assignments/${assignmentId}`, { reason })
  }

  // ============================================================================
  // SURVEY RESPONSE METHODS
  // ============================================================================

  static async submitResponse(data: {
    survey_id: string
    user_id: string
    assignment_id: string
    responses: FormResponses
    completion_time_minutes?: number
    is_refill?: boolean
    response_attempt?: number
  }): Promise<ApiResponse<any>> {
    return this.post('/responses', data)
  }

  static async getResponses(surveyId: string, companyId?: string): Promise<{ responses: SurveyResponse[] }> {
    const params = companyId ? `?company_id=${companyId}` : ''
    return this.get(`/surveys/${surveyId}/responses${params}`)
  }

  // ============================================================================
  // SURVEY REFILL METHODS
  // ============================================================================

  static async requestRefill(surveyId: string, data: {
    user_id?: string
    assignment_id?: string
    reason?: string
    admin_notes?: string
  }): Promise<{ 
    message: string
    survey_id: string
    user_id: string
    attempt_number: number
    status: string
    timestamp: string
  }> {
    return this.post(`/surveys/${surveyId}/refill`, data)
  }

  static async getRefillHistory(surveyId: string, userId?: string): Promise<{
    survey_id: string
    user_id: string
    total_attempts: number
    refill_attempts: number
    responses: any[]
    refill_comments: any[]
  }> {
    const params = userId ? `?user_id=${userId}` : ''
    return this.get(`/surveys/${surveyId}/refill${params}`)
  }

  // ============================================================================
  // COMMENT METHODS
  // ============================================================================

  static async getComments(filters: {
    survey_id: string
    assignment_id?: string | null
    user_id?: string
  }): Promise<CommentsResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return this.get(`/comments?${params.toString()}`)
  }

  static async createComment(data: {
    survey_id: string
    assignment_id?: string | null
    recipient_id?: string
    comment_text: string
    comment_type?: CommentType
    parent_comment_id?: string
  }): Promise<{ comment: CommentWithUser }> {
    return this.post('/comments', data)
  }

  static async markCommentAsRead(id: string): Promise<{ comment: SurveyComment }> {
    return this.patch(`/comments/${id}`, {})
  }

  static async deleteComment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/comments/${id}`)
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  static async getAnalytics(surveyId: string, companyId?: string): Promise<AnalyticsResponse> {
    const params = companyId ? `?company_id=${companyId}` : ''
    return this.get(`/analytics/${surveyId}${params}`)
  }

  static async getCompanyAnalytics(companyId: string): Promise<{
    total_surveys: number
    total_users: number
    total_responses: number
    completion_rate: number
  }> {
    return this.get(`/analytics/company/${companyId}`)
  }

  // ============================================================================
  // SECTION & QUESTION METHODS (existing, for compatibility)
  // ============================================================================

  static async createSection(data: Partial<SurveySection>): Promise<{ section: SurveySection }> {
    return this.post('/sections', data)
  }

  static async updateSection(id: string, data: Partial<SurveySection>): Promise<{ section: SurveySection }> {
    return this.put(`/sections/${id}`, data)
  }

  static async deleteSection(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/sections/${id}`)
  }

  static async createQuestion(data: Partial<Question> & { options?: string[] }): Promise<{ question: Question }> {
    return this.post('/questions', data)
  }

  static async updateQuestion(id: string, data: Partial<Question> & { options?: string[] }): Promise<{ question: Question }> {
    return this.put(`/questions/${id}`, data)
  }

  static async deleteQuestion(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/questions/${id}`)
  }
}