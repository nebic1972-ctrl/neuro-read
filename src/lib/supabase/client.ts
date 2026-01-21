/**
 * Typed Supabase browser client for use in Client Components and browser-only code.
 * Uses @supabase/ssr for cookie-based session handling in Next.js.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export function createClient() {
  return createBrowserClient<Database>(url, anonKey);
}
