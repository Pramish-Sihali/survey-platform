import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Form step types
export interface FormStep {
  id: string
  title: string
  questions: Question[]
}

export interface Question {
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