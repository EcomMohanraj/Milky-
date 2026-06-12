"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/services/api-client";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN: User = {
  id: "admin-user-id",
  name: "Milky Mushrooms Admin",
  email: "admin@milky.com",
  phone: "+91 98765 43210",
  role: "admin",
};

const MOCK_CUSTOMER: User = {
  id: "customer-user-id",
  name: "Mohan Kumar",
  email: "customer@gmail.com",
  phone: "+91 99887 76655",
  role: "customer",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load auth state
  useEffect(() => {
    const initAuth = async () => {
      const client = supabase;
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            // Fetch profile role
            const profile = await authService.getUserProfile(session.user.id);
            
            if (profile) {
              setUser(profile);
            } else {
              // Create default profile if not exists
              const newUser: User = {
                id: session.user.id,
                name: session.user.user_metadata?.name || "Customer",
                email: session.user.email || "",
                role: "customer",
              };
              setUser(newUser);
            }
          }
        } catch (err) {
          console.error("Supabase auth session fetch error: ", err);
        }

        // Subscribe to auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await authService.getUserProfile(session.user.id);
            if (profile) {
              setUser(profile);
            } else {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || "Customer",
                email: session.user.email || "",
                role: "customer",
              });
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } else {
        // Mock Auth
        const storedUser = localStorage.getItem("milky_current_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Pre-seed mock customer so they are logged in by default for convenience
          localStorage.setItem("milky_current_user", JSON.stringify(MOCK_CUSTOMER));
          setUser(MOCK_CUSTOMER);
        }
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: password || "password" });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Mock Login
      if (email.toLowerCase() === "admin@milky.com") {
        localStorage.setItem("milky_current_user", JSON.stringify(MOCK_ADMIN));
        setUser(MOCK_ADMIN);
        return { success: true };
      }
      
      // Look up in registered mock users
      const usersRaw = localStorage.getItem("milky_registered_users");
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [MOCK_CUSTOMER, MOCK_ADMIN];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (found) {
        localStorage.setItem("milky_current_user", JSON.stringify(found));
        setUser(found);
        return { success: true };
      } else {
        // Create user on the fly as customer for testing convenience
        const newUser: User = {
          id: "usr-" + Math.random().toString(36).substr(2, 9),
          name: email.split("@")[0],
          email,
          role: "customer",
        };
        users.push(newUser);
        localStorage.setItem("milky_registered_users", JSON.stringify(users));
        localStorage.setItem("milky_current_user", JSON.stringify(newUser));
        setUser(newUser);
        return { success: true };
      }
    }
  };

  const register = async (name: string, email: string, phone: string, password?: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || "password",
        options: {
          data: { name, phone, role: "customer" },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Mock Register
      const newUser: User = {
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        role: "customer",
      };
      const usersRaw = localStorage.getItem("milky_registered_users");
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [MOCK_CUSTOMER, MOCK_ADMIN];
      
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email already registered." };
      }

      users.push(newUser);
      localStorage.setItem("milky_registered_users", JSON.stringify(users));
      localStorage.setItem("milky_current_user", JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("milky_current_user");
    }
    setUser(null);
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    if (supabase) {
      const { success, error } = await authService.updateUserProfile(user.id, name, phone);
      if (!success) return { success: false, error };
      setUser({ ...user, name, phone });
      return { success: true };
    } else {
      const updatedUser = { ...user, name, phone };
      localStorage.setItem("milky_current_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Sync in list
      const usersRaw = localStorage.getItem("milky_registered_users");
      if (usersRaw) {
        const users: User[] = JSON.parse(usersRaw);
        const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
        localStorage.setItem("milky_registered_users", JSON.stringify(updatedList));
      }
      return { success: true };
    }
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
