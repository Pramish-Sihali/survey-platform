// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
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
          title: string
          description: string | null
          is_active: boolean
          is_published: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_active?: boolean
          is_published?: boolean
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          is_active?: boolean
          is_published?: boolean
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
      survey_responses: {
        Row: {
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
        Insert: {
          id?: string
          survey_id: string
          employee_name: string
          employee_designation: string
          employee_department: string
          employee_supervisor: string
          employee_reports_to: string
          submitted_at?: string
          completion_time_minutes?: number | null
        }
        Update: {
          id?: string
          survey_id?: string
          employee_name?: string
          employee_designation?: string
          employee_department?: string
          employee_supervisor?: string
          employee_reports_to?: string
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
    }
  }
}