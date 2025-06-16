// lib/api/client.ts - Enhanced Multi-Tenant B2B Survey Platform API Client
import {
  ApiResponse,
  Company,
  CompaniesResponse,
  CompanyDetailResponse,
  User,
  UserProfile,
  SafeUserWithProfile,
  UsersResponse,
  UserDetailResponse,
  Survey,
  SurveyListResponse,
  SurveyDetailResponse,
  SurveySection,
  Question,
  SurveyAssignment,
  SurveyAssignmentWithDetails,
  AssignmentsResponse,
  AssignmentStatus,
  CommentWithUser,
  CommentsResponse,
  CommentType,
  FormResponses,
  AnalyticsResponse,
  UserRole
} from '@/lib/types'

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class ApiClient {
  static getDepartments() {
    throw new Error('Method not implemented.')
  }
  private static baseUrl = '/api'
  private static authToken: string | null = null

  // Set authentication token
  static setAuthToken(token: string) {
    this.authToken = token
  }

  static clearAuthToken() {
    this.authToken = null
  }

  static getAuthToken(): string | null {
    return this.authToken
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
      let errorMessage = `API Error: ${response.status}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    
    return response.text() as T
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
    const result = await this.post<{ user: SafeUserWithProfile; token: string }>('/auth/login', { email, password })
    if (result.token) {
      this.setAuthToken(result.token)
    }
    return result
  }

  static async logout(): Promise<ApiResponse<any>> {
    try {
      const result = await this.post<ApiResponse<any>>('/auth/logout', {})
      this.clearAuthToken()
      return result
    } catch (error) {
      // Even if logout fails, clear the token locally
      this.clearAuthToken()
      throw error
    }
  }

  static async getCurrentUser(): Promise<UserDetailResponse> {
    return this.get('/auth/me')
  }

  // ============================================================================
  // COMPANY MANAGEMENT (Super Admin)
  // ============================================================================

  static async getCompanies(params?: {
    page?: number
    limit?: number
    is_active?: boolean
  }): Promise<CompaniesResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/companies?${query.toString()}` : '/companies'
    return this.get(endpoint)
  }

  static async getCompany(id: string): Promise<CompanyDetailResponse> {
    return this.get(`/companies/${id}`)
  }

  static async createCompany(data: {
    name: string
    domain?: string
    subscription_plan: 'basic' | 'professional' | 'premium' | 'enterprise'
    max_users: number
    max_surveys: number
    is_active?: boolean
  }): Promise<{ company: Company }> {
    return this.post('/companies', data)
  }

  static async updateCompany(id: string, data: {
    name?: string
    domain?: string
    subscription_plan?: 'basic' | 'professional' | 'premium' | 'enterprise'
    max_users?: number
    max_surveys?: number
    is_active?: boolean
  }): Promise<{ company: Company }> {
    return this.put(`/companies/${id}`, data)
  }

  static async deleteCompany(id: string): Promise<{
    message: string
    deleted: {
      company: string
      users: number
      surveys: number
    }
  }> {
    return this.delete(`/companies/${id}`)
  }

  // ============================================================================
  // USER MANAGEMENT (Enhanced)
  // ============================================================================

  static async getUsers(params?: {
    company_id?: string
    role?: UserRole
    is_active?: boolean
    page?: number
    limit?: number
  }): Promise<UsersResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/users?${query.toString()}` : '/users'
    return this.get(endpoint)
  }

  static async getUser(id: string): Promise<UserDetailResponse> {
    return this.get(`/users/${id}`)
  }

  static async createUser(data: {
    email: string
    name: string
    password?: string
    role: UserRole
    company_id: string
    profile?: Partial<UserProfile>
  }): Promise<{ user: SafeUserWithProfile; temporaryPassword?: string }> {
    return this.post('/users', data)
  }

  static async updateUser(id: string, data: {
    name?: string
    email?: string
    role?: UserRole
    is_active?: boolean
    company_id?: string
    password?: string
    profile?: Partial<UserProfile>
  }): Promise<{ user: SafeUserWithProfile }> {
    return this.put(`/users/${id}`, data)
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<{ user: SafeUserWithProfile }> {
    return this.patch(`/users/${userId}`, { profile: data })
  }

  static async deleteUser(id: string): Promise<{
    message: string
    deleted: {
      user: string
      email: string
    }
  }> {
    return this.delete(`/users/${id}`)
  }

  // ============================================================================
  // SURVEY METHODS (Company-specific)
  // ============================================================================

  static async getSurveys(params?: {
    company_id?: string
    is_active?: boolean
    is_published?: boolean
    created_by?: string
    page?: number
    limit?: number
  }): Promise<SurveyListResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/surveys?${query.toString()}` : '/surveys'
    return this.get(endpoint)
  }

  static async getSurvey(id: string): Promise<SurveyDetailResponse> {
    return this.get(`/surveys/${id}`)
  }

  static async createSurvey(data: Partial<Survey> & {
    sections?: Array<Partial<SurveySection> & {
      questions?: Array<Partial<Question> & { options?: string[] }>
    }>
  }): Promise<{ survey: Survey }> {
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

  static async getAssignments(params?: {
    user_id?: string
    survey_id?: string
    status?: AssignmentStatus
    company_id?: string
    page?: number
    limit?: number
  }): Promise<AssignmentsResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/survey-assignments?${query.toString()}` : '/survey-assignments'
    return this.get(endpoint)
  }

  static async getAssignment(id: string): Promise<{ assignment: SurveyAssignmentWithDetails }> {
    return this.get(`/survey-assignments/${id}`)
  }

  static async createAssignments(data: {
    survey_id: string
    user_ids: string[]
    notes?: string
    due_date?: string
  }): Promise<{ assignments: SurveyAssignmentWithDetails[]; count: number }> {
    return this.post('/survey-assignments', data)
  }

  static async updateAssignment(id: string, data: {
    status?: AssignmentStatus
    notes?: string
    due_date?: string
  }): Promise<{ assignment: SurveyAssignmentWithDetails }> {
    return this.put(`/survey-assignments/${id}`, data)
  }

  static async deleteAssignment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/survey-assignments/${id}`)
  }

  static async requestAssignmentRefill(assignmentId: string, reason?: string): Promise<{ assignment: SurveyAssignmentWithDetails }> {
    return this.patch(`/survey-assignments/${assignmentId}`, { reason })
  }

  // ============================================================================
  // SURVEY RESPONSE METHODS
  // ============================================================================

  static async submitResponse(data: {
    survey_id: string
    user_id?: string
    assignment_id?: string
    responses: FormResponses
    completion_time_minutes?: number
    is_refill?: boolean
    response_attempt?: number
  }): Promise<{ message: string; response_id: string }> {
    return this.post('/responses', data)
  }

  static async getResponses(surveyId: string, params?: {
    company_id?: string
    user_id?: string
  }): Promise<{ responses: any[] }> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/surveys/${surveyId}/responses?${query.toString()}` : `/surveys/${surveyId}/responses`
    return this.get(endpoint)
  }

  // ============================================================================
  // SURVEY REFILL METHODS
  // ============================================================================

  static async requestSurveyRefill(surveyId: string, data: {
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

  static async getComments(params: {
    survey_id: string
    assignment_id?: string | null
    user_id?: string
    page?: number
    limit?: number
  }): Promise<CommentsResponse> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value.toString())
      }
    })
    return this.get(`/comments?${query.toString()}`)
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

  static async updateComment(id: string, data: {
    comment_text?: string
    is_read?: boolean
  }): Promise<{ comment: CommentWithUser }> {
    return this.put(`/comments/${id}`, data)
  }

  static async markCommentAsRead(id: string): Promise<{ comment: CommentWithUser }> {
    return this.patch(`/comments/${id}`, {})
  }

  static async deleteComment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/comments/${id}`)
  }

  // ============================================================================
  // ANALYTICS METHODS (Enhanced)
  // ============================================================================

  static async getSurveyAnalytics(surveyId: string, params?: {
    company_id?: string
  }): Promise<AnalyticsResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString())
        }
      })
    }
    const endpoint = query.toString() ? `/analytics/${surveyId}?${query.toString()}` : `/analytics/${surveyId}`
    return this.get(endpoint)
  }

  static async getCompanyAnalytics(companyId: string): Promise<{
    total_surveys: number
    total_users: number
    total_responses: number
    completion_rate: number
    recent_activity: any[]
  }> {
    return this.get(`/analytics/company/${companyId}`)
  }

  static async getPlatformAnalytics(): Promise<{
    total_companies: number
    total_users: number
    total_surveys: number
    total_responses: number
    active_companies: number
    recent_signups: any[]
  }> {
    return this.get('/analytics/platform')
  }

  // ============================================================================
  // SUPER ADMIN SPECIFIC METHODS
  // ============================================================================

  /**
   * Get platform statistics for super admin dashboard
   */
  static async getPlatformStats(): Promise<{
    stats: {
      companies: { total: number; active: number }
      users: { total: number; active: number }
      surveys: { total: number; active: number }
      responses: { total: number }
      pending_issues: number
    }
    recent_activity: {
      companies: Array<{ name: string; created_at: string }>
      users: Array<{ name: string; created_at: string; companies?: { name: string } }>
    }
  }> {
    return this.get('/super-admin/stats')
  }

  /**
   * Bulk operations for super admin
   */
  static async bulkUpdateCompanies(updates: Array<{
    id: string
    is_active?: boolean
    subscription_plan?: string
  }>): Promise<{ updated: number; failed: number }> {
    return this.post('/super-admin/companies/bulk-update', { updates })
  }

  static async bulkUpdateUsers(updates: Array<{
    id: string
    is_active?: boolean
    role?: UserRole
  }>): Promise<{ updated: number; failed: number }> {
    return this.post('/super-admin/users/bulk-update', { updates })
  }

  /**
   * Platform settings management
   */
  static async getPlatformSettings(): Promise<{
    general: any
    subscriptions: any
    security: any
    notifications: any
  }> {
    return this.get('/super-admin/settings')
  }

  static async updatePlatformSettings(settings: {
    general?: any
    subscriptions?: any
    security?: any
    notifications?: any
  }): Promise<{ message: string }> {
    return this.put('/super-admin/settings', settings)
  }

  /**
   * Data export for super admin
   */
  static async exportPlatformData(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/super-admin/export?format=${format}`, {
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    return response.blob()
  }

  // ============================================================================
  // SECTION & QUESTION METHODS (Survey Building)
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

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if the client is authenticated
   */
  static isAuthenticated(): boolean {
    return this.authToken !== null
  }

  /**
   * Get base URL for API endpoints
   */
  static getBaseUrl(): string {
    return this.baseUrl
  }

  /**
   * Set custom base URL (useful for testing)
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url
  }

  /**
   * Generic upload method for file uploads
   */
  static async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
    }

    const headers: Record<string, string> = {}
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload Error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Health check method
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  /**
   * Get system status for monitoring
   */
  static async getSystemStatus(): Promise<{
    database: 'healthy' | 'degraded' | 'down'
    api: 'healthy' | 'degraded' | 'down'
    storage: 'healthy' | 'degraded' | 'down'
    uptime: number
    version: string
  }> {
    return this.get('/system/status')
  }
}