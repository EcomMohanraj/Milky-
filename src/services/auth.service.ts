import { User } from "@/types";
import { supabase, isSupabaseConfigured } from "./api-client";

export const authService = {
  async getUserProfile(userId: string): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) return data as User;
    }
    return null;
  },

  async updateUserProfile(userId: string, name: string, phone: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("users")
        .update({ name, phone })
        .eq("id", userId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true }; // Managed in mock localStorage state inside context if not configured
  }
};
