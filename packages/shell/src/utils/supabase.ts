import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "") as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

let supabaseInstance: SupabaseClient | null = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    new URL(supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConfigured = true;
  } catch (err) {
    console.error("Supabase initialization failed (check VITE_SUPABASE_URL):", err);
    supabaseInstance = null;
    isSupabaseConfigured = false;
  }
}

export const supabase = supabaseInstance;
export { isSupabaseConfigured };

