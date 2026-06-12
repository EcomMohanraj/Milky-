import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if credentials are valid (i.e. not default placeholders or empty)
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://mock-project.supabase.co" &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "mock-anon-key" &&
  supabaseAnonKey !== "your-supabase-anon-key";
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
// Helper to get local storage helper in browser
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
