// lib/utils.ts - COMPLETE UPDATED FILE
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Database-aligned types
export interface Survey {
  id: string
  title: string
  description: string | null
  is_active: boolean
  is_published: boolean
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

export interface Department {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SurveyResponse {
  id: string
  survey_id: string
  employee_name: string
  employee_designation: string
  employee_department: string
  employee_supervisor: string
  employee_reports_to: string
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

// Legacy types for compatibility (converted from database types)
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

// Form response types
export type FormResponseValue = 
  | string 
  | number 
  | string[] 
  | { main: string | number; other?: string }

export type FormResponses = Record<string, FormResponseValue>

// Analytics types
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

export interface AuditQuestion {
  id: string
  survey_id: string
  question_text: string
  question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
  is_required: boolean
  has_other_option: boolean
  order_index: number
  category: string
  description: string | null
  metadata: any
  created_by: string | null
  created_at: string
  updated_at: string
  survey_audit_question_options?: AuditQuestionOption[]
}

export interface AuditQuestionOption {
  id: string
  survey_audit_question_id: string
  option_text: string
  order_index: number
  created_at: string
}

export interface AuditResponse {
  id: string
  survey_id: string
  survey_audit_question_id: string
  response_type: 'text' | 'number' | 'array' | 'object'
  text_response: string | null
  number_response: number | null
  array_response: string[] | null
  object_response: any | null
  responded_by: string | null
  responded_at: string
  updated_at: string
}

export interface AuditQuestionsResponse {
  auditQuestions: AuditQuestion[]
}

export interface AuditResponsesResponse {
  auditResponses: AuditResponse[]
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface SurveyListResponse {
  surveys: Survey[]
}

export interface SurveyDetailResponse {
  survey: Survey
}

export interface DepartmentsResponse {
  departments: Department[]
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

// Utility functions
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
  employeeInfo: EmployeeInfo,
  responses: FormResponses,
  completionTimeMinutes?: number
) {
  return {
    survey_id: surveyId,
    employee_info: employeeInfo,
    responses,
    completion_time_minutes: completionTimeMinutes
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function isDateInRange(startDate: string | null, endDate: string | null): boolean {
  if (!startDate || !endDate) return true
  
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return now >= start && now <= end
}

// API client functions
export class ApiClient {
  private static baseUrl = '/api'

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  // Survey methods
  static getSurveys(): Promise<SurveyListResponse> {
    return this.get('/surveys')
  }

  static getSurvey(id: string): Promise<SurveyDetailResponse> {
    return this.get(`/surveys/${id}`)
  }

  static createSurvey(data: Partial<Survey>): Promise<{ survey: Survey }> {
    return this.post('/surveys', data)
  }

  static updateSurvey(id: string, data: Partial<Survey>): Promise<{ survey: Survey }> {
    return this.put(`/surveys/${id}`, data)
  }

  static deleteSurvey(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/surveys/${id}`)
  }

  // Department methods - UPDATED TO USE CONSOLIDATED API
  static getDepartments(adminView = false): Promise<DepartmentsResponse> {
    const endpoint = adminView ? '/departments?admin=true' : '/departments'
    return this.get(endpoint)
  }

  static createDepartment(data: Partial<Department>): Promise<{ department: Department }> {
    return this.post('/departments', data)
  }

  static updateDepartment(id: string, data: Partial<Department>): Promise<{ department: Department }> {
    return this.put(`/departments/${id}`, data)
  }

  static deleteDepartment(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/departments/${id}`)
  }

  // Section methods
  static createSection(data: Partial<SurveySection>): Promise<{ section: SurveySection }> {
    return this.post('/sections', data)
  }

  static updateSection(id: string, data: Partial<SurveySection>): Promise<{ section: SurveySection }> {
    return this.put(`/sections/${id}`, data)
  }

  static deleteSection(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/sections/${id}`)
  }

  // Question methods
  static createQuestion(data: Partial<Question> & { options?: string[] }): Promise<{ question: Question }> {
    return this.post('/questions', data)
  }

  static updateQuestion(id: string, data: Partial<Question> & { options?: string[] }): Promise<{ question: Question }> {
    return this.put(`/questions/${id}`, data)
  }

  static deleteQuestion(id: string): Promise<ApiResponse<any>> {
    return this.delete(`/questions/${id}`)
  }

  // Response methods
  static submitResponse(data: any): Promise<ApiResponse<any>> {
    return this.post('/responses', data)
  }

  // Analytics methods
  static getAnalytics(surveyId: string): Promise<AnalyticsResponse> {
    return this.get(`/analytics/${surveyId}`)
  }
}

// Audit API client
export class AuditApiClient {
  private static baseUrl = '/api/admin'

  static async getAuditQuestions(surveyId: string): Promise<AuditQuestionsResponse> {
    const response = await fetch(`${this.baseUrl}/surveys/${surveyId}/audit-questions`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async createAuditQuestion(surveyId: string, data: Partial<AuditQuestion> & { options?: string[] }): Promise<{ auditQuestion: AuditQuestion }> {
    const response = await fetch(`${this.baseUrl}/surveys/${surveyId}/audit-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async updateAuditQuestion(questionId: string, data: Partial<AuditQuestion> & { options?: string[] }): Promise<{ auditQuestion: AuditQuestion }> {
    const response = await fetch(`${this.baseUrl}/audit-questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async deleteAuditQuestion(questionId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/audit-questions/${questionId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async getAuditResponses(surveyId: string): Promise<AuditResponsesResponse> {
    const response = await fetch(`${this.baseUrl}/surveys/${surveyId}/audit-responses`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  static async saveAuditResponses(surveyId: string, responses: Record<string, any>, respondedBy?: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/surveys/${surveyId}/audit-responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responses,
        responded_by: respondedBy
      })
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }
}