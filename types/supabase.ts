export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: "student" | "mentor" | "admin"
          xp: number
          level: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role: "student" | "mentor" | "admin"
          xp?: number
          level?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: "student" | "mentor" | "admin"
          xp?: number
          level?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_id: string | null
          thumbnail_url: string | null
          status: "draft" | "published" | "archived"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_id?: string | null
          thumbnail_url?: string | null
          status: "draft" | "published" | "archived"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_id?: string | null
          thumbnail_url?: string | null
          status?: "draft" | "published" | "archived"
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table definitions as needed
    }
  }
}
