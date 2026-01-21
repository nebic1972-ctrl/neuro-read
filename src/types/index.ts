/**
 * Commercial Cognitive Training SaaS – TypeScript interfaces
 * Aligned with Supabase public schema (profiles, library, user_settings, exercise_log)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Domain models (supabase table row shapes)
// ---------------------------------------------------------------------------

export type NeuroType = 'ADHD' | 'DYSLEXIA' | 'NEUROTYPICAL' | 'OTHER' | null;

export interface Profile {
  /** Primary key, matches auth.uid (Clerk user ID) */
  id: string;
  /** User ID from Clerk (same as id, kept for compatibility) */
  user_id: string;
  neuro_type: NeuroType;
  xp_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface Library {
  id: string;
  user_id: string;
  title: string;
  content_text: string;
  file_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  wpm_speed: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_type: string;
  score?: number;
  duration_sec?: number;
  metadata?: Json;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Supabase Database schema for typed clients
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'user_id'>>;
      };
      library: {
        Row: Library;
        Insert: Omit<Library, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Library, 'id' | 'user_id'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserSettings, 'id' | 'user_id'>>;
      };
      exercise_log: {
        Row: ExerciseLog;
        Insert: Omit<ExerciseLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ExerciseLog, 'id' | 'user_id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
