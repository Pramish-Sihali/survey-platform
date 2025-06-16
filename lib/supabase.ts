// lib/supabase.ts - Updated for Multi-Tenant B2B Survey Platform
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ============================================================================
// DATABASE TYPES - Multi-Tenant B2B Survey Platform
// ============================================================================

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          domain?: string | null
          subscription_plan?: string
          is_active?: boolean
          max_users?: number
          max_surveys?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          subscription_plan?: string
          is_active?: boolean
          max_users?: number
          max_surveys?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          email: string
          password_hash: string
          name: string
          role: 'super_admin' | 'company_admin' | 'company_user'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          email: string
          password_hash: string
          name: string
          role: 'super_admin' | 'company_admin' | 'company_user'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string | null
          email?: string
          password_hash?: string
          name?: string
          role?: 'super_admin' | 'company_admin' | 'company_user'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      user_profiles: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          designation?: string | null
          department_id?: string | null
          supervisor_name?: string | null
          reports_to?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          hire_date?: string | null
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          designation?: string | null
          department_id?: string | null
          supervisor_name?: string | null
          reports_to?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          hire_date?: string | null
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
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
        }
        Insert: {
          id?: string
          company_id: string
          created_by?: string | null
          title: string
          description?: string | null
          is_active?: boolean
          is_published?: boolean
          allows_refill?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          is_active?: boolean
          is_published?: boolean
          allows_refill?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      survey_sections: {
        Row: {
          id: string
          survey_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          section_id: string
          question_text: string
          question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
          is_required: boolean
          has_other_option: boolean
          order_index: number
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          question_text: string
          question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
          is_required?: boolean
          has_other_option?: boolean
          order_index: number
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          question_text?: string
          question_type?: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
          is_required?: boolean
          has_other_option?: boolean
          order_index?: number
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          order_index?: number
          created_at?: string
        }
      }
      survey_assignments: {
        Row: {
          id: string
          survey_id: string
          user_id: string
          assigned_by: string
          status: 'pending' | 'in_progress' | 'completed' | 'refill_requested'
          assigned_at: string
          completed_at: string | null
          due_date: string | null
          refill_count: number
          notes: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          user_id: string
          assigned_by: string
          status?: 'pending' | 'in_progress' | 'completed' | 'refill_requested'
          assigned_at?: string
          completed_at?: string | null
          due_date?: string | null
          refill_count?: number
          notes?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string
          assigned_by?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'refill_requested'
          assigned_at?: string
          completed_at?: string | null
          due_date?: string | null
          refill_count?: number
          notes?: string | null
        }
      }
      survey_responses: {
        Row: {
          id: string
          survey_id: string
          user_id: string | null
          assignment_id: string | null
          response_attempt: number
          is_refill: boolean
          submitted_at: string
          completion_time_minutes: number | null
        }
        Insert: {
          id?: string
          survey_id: string
          user_id?: string | null
          assignment_id?: string | null
          response_attempt?: number
          is_refill?: boolean
          submitted_at?: string
          completion_time_minutes?: number | null
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string | null
          assignment_id?: string | null
          response_attempt?: number
          is_refill?: boolean
          submitted_at?: string
          completion_time_minutes?: number | null
        }
      }
      question_responses: {
        Row: {
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
        Insert: {
          id?: string
          survey_response_id: string
          question_id: string
          response_type: 'text' | 'number' | 'array' | 'object'
          text_response?: string | null
          number_response?: number | null
          array_response?: string[] | null
          object_response?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          survey_response_id?: string
          question_id?: string
          response_type?: 'text' | 'number' | 'array' | 'object'
          text_response?: string | null
          number_response?: number | null
          array_response?: string[] | null
          object_response?: any | null
          created_at?: string
        }
      }
      survey_comments: {
        Row: {
          id: string
          survey_id: string
          assignment_id: string | null
          user_id: string
          recipient_id: string | null
          comment_text: string
          comment_type: 'general' | 'clarification' | 'feedback' | 'refill_request'
          is_read: boolean
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          assignment_id?: string | null
          user_id: string
          recipient_id?: string | null
          comment_text: string
          comment_type?: 'general' | 'clarification' | 'feedback' | 'refill_request'
          is_read?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          assignment_id?: string | null
          user_id?: string
          recipient_id?: string | null
          comment_text?: string
          comment_type?: 'general' | 'clarification' | 'feedback' | 'refill_request'
          is_read?: boolean
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      survey_audit_questions: {
        Row: {
          id: string
          survey_id: string
          company_id: string | null
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
          section_id: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          company_id?: string | null
          question_text: string
          question_type: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
          is_required?: boolean
          has_other_option?: boolean
          order_index: number
          category?: string
          description?: string | null
          metadata?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
          section_id?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          company_id?: string | null
          question_text?: string
          question_type?: 'text' | 'yes_no' | 'radio' | 'checkbox' | 'rating' | 'select'
          is_required?: boolean
          has_other_option?: boolean
          order_index?: number
          category?: string
          description?: string | null
          metadata?: any
          created_by?: string | null
          created_at?: string
          updated_at?: string
          section_id?: string | null
        }
      }
      survey_audit_question_options: {
        Row: {
          id: string
          survey_audit_question_id: string
          option_text: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          survey_audit_question_id: string
          option_text: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          survey_audit_question_id?: string
          option_text?: string
          order_index?: number
          created_at?: string
        }
      }
      survey_audit_responses: {
        Row: {
          id: string
          survey_id: string
          survey_audit_question_id: string
          user_id: string | null
          response_type: 'text' | 'number' | 'array' | 'object'
          text_response: string | null
          number_response: number | null
          array_response: string[] | null
          object_response: any | null
          responded_by: string | null
          responded_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          survey_audit_question_id: string
          user_id?: string | null
          response_type: 'text' | 'number' | 'array' | 'object'
          text_response?: string | null
          number_response?: number | null
          array_response?: string[] | null
          object_response?: any | null
          responded_by?: string | null
          responded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          survey_audit_question_id?: string
          user_id?: string | null
          response_type?: 'text' | 'number' | 'array' | 'object'
          text_response?: string | null
          number_response?: number | null
          array_response?: string[] | null
          object_response?: any | null
          responded_by?: string | null
          responded_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_complete_info: {
        Row: {
          id: string
          company_id: string | null
          email: string
          name: string
          role: 'super_admin' | 'company_admin' | 'company_user'
          is_active: boolean
          last_login: string | null
          created_at: string
          company_name: string | null
          designation: string | null
          department_id: string | null
          supervisor_name: string | null
          reports_to: string | null
          phone: string | null
          avatar_url: string | null
          bio: string | null
          hire_date: string | null
          is_profile_complete: boolean
          department_name: string | null
        }
      }
      survey_assignments_detailed: {
        Row: {
          id: string
          survey_id: string
          user_id: string
          assigned_by: string
          status: 'pending' | 'in_progress' | 'completed' | 'refill_requested'
          assigned_at: string
          completed_at: string | null
          due_date: string | null
          refill_count: number
          notes: string | null
          survey_title: string
          survey_description: string | null
          user_name: string
          user_email: string
          assigned_by_name: string
          company_name: string
        }
      }
    }
    Functions: {
      get_user_company_id: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
      user_can_access_survey: {
        Args: {
          user_uuid: string
          survey_uuid: string
        }
        Returns: boolean
      }
    }
  }
}

// ============================================================================
// HELPER TYPES for Application Use
// ============================================================================

export type UserRole = Database['public']['Tables']['users']['Row']['role']
export type AssignmentStatus = Database['public']['Tables']['survey_assignments']['Row']['status']
export type CommentType = Database['public']['Tables']['survey_comments']['Row']['comment_type']
export type QuestionType = Database['public']['Tables']['questions']['Row']['question_type']

// Company with related data
export type CompanyWithStats = Database['public']['Tables']['companies']['Row'] & {
  user_count?: number
  survey_count?: number
  active_assignments?: number
}

// User with complete profile information
export type UserWithProfile = Database['public']['Views']['user_complete_info']['Row']

// Survey assignment with detailed information
export type AssignmentWithDetails = Database['public']['Views']['survey_assignments_detailed']['Row']

// Survey with company and creator information
export type SurveyWithRelations = Database['public']['Tables']['surveys']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row']
  created_by_user?: Database['public']['Tables']['users']['Row']
  survey_sections?: (Database['public']['Tables']['survey_sections']['Row'] & {
    questions?: (Database['public']['Tables']['questions']['Row'] & {
      question_options?: Database['public']['Tables']['question_options']['Row'][]
    })[]
  })[]
  assignments?: AssignmentWithDetails[]
}

// Comment with user information
export type CommentWithUser = Database['public']['Tables']['survey_comments']['Row'] & {
  user: Database['public']['Tables']['users']['Row']
  recipient?: Database['public']['Tables']['users']['Row']
  replies?: CommentWithUser[]
}

// Survey response with user and assignment info
export type ResponseWithDetails = Database['public']['Tables']['survey_responses']['Row'] & {
  user?: Database['public']['Tables']['users']['Row']
  assignment?: Database['public']['Tables']['survey_assignments']['Row']
  question_responses?: Database['public']['Tables']['question_responses']['Row'][]
}

// Department with company info
export type DepartmentWithCompany = Database['public']['Tables']['departments']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row']
  user_count?: number
}