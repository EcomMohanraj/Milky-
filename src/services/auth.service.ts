import { User } from "@/types";

export const authService = {
  async getUserProfile(_userId: string): Promise<User | null> {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user as User;
    } catch (err) {
      console.error("getUserProfile fetch error:", err);
      return null;
    }
  },

  async updateUserProfile(userId: string, name: string, phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || "Failed to update profile." };
      }
      return { success: true };
    } catch (err) {
      console.error("updateUserProfile fetch error:", err);
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      return { success: false, error: message };
    }
  }
};
