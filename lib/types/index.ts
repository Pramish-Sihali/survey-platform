// lib/types/index.ts - Multi-Tenant B2B Survey Platform Types
// ============================================================================
// CORE MULTI-TENANT TYPES
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
  
  // Sanitized user types (without password_hash)
  export interface SafeUser extends Omit<User, 'password_hash'> {}
  export interface SafeUserWithProfile extends Omit<UserWithProfile, 'password_hash'> {}
  
  // Department Types
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
  
  // Survey Types
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
  
  // Survey Response Types
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
  // API RESPONSE TYPES
  // ============================================================================
  
  export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
  }
  
  // User Management API Responses
  export interface UsersResponse {
    users: SafeUserWithProfile[]
    total?: number
  }
  
  export interface UserDetailResponse {
    user: SafeUserWithProfile
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