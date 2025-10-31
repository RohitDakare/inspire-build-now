export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          domain: string
          technologies: string[]
          features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          domain: string
          technologies: string[]
          features: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          domain?: string
          technologies?: string[]
          features?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
