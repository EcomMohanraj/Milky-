"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string; verificationToken?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load auth state from secure HTTP session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user as User);
          }
        } else {
          // If we got a 401/404/etc, we should clear the invalid/expired token cookie
          await fetch("/api/auth/logout", { method: "POST" });
        }
      } catch (err) {
        console.error("Session load error: ", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Wrong email/password." };
      }

      setUser(data.user as User);
      return { success: true };
    } catch (err) {
      console.error("Login context error:", err);
      const message = err instanceof Error ? err.message : "Authentication failed.";
      return { success: false, error: message };
    }
  };

  const register = async (name: string, email: string, phone: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password: password || "" }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed." };
      }

      return { success: true, verificationToken: data.verificationToken };
    } catch (err) {
      console.error("Register context error:", err);
      const message = err instanceof Error ? err.message : "Registration failed.";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    const { success, error } = await authService.updateUserProfile(user.id, name, phone);
    if (success) {
      setUser({ ...user, name, phone });
      return { success: true };
    }
    return { success: false, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
