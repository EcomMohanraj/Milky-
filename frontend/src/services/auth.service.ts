import { User } from "@/types";
import { apiFetch } from "./api-client";

export const authService = {
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const res = await apiFetch("/api/auth/session");
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && data.user) {
        return data.user as User;
      }
    } catch (err) {
      console.error("getUserProfile failed:", err);
    }
    return null;
  },

  async updateUserProfile(userId: string, name: string, phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await apiFetch("/api/auth/session", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to update profile." };
    } catch (err) {
      console.error("updateUserProfile failed:", err);
      return { success: false, error: "Network error occurred." };
    }
  }
};
