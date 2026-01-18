import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase Key eksik!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Reading {
  id: string;
  user_id: string;
  username: string;
  wpm: number;
  created_at: string;
  // --- YENİ EKLENENLER ---
  quiz_score?: number;   // Puan (Örn: 100 üzerinden 66)
  quiz_total?: number;   // Toplam Soru Sayısı (3)
  quiz_correct?: number; // Doğru Cevap Sayısı (2)
}

export interface LibraryItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  file_type: string;
  is_completed: boolean;
  last_position: number;
  created_at: string;
}