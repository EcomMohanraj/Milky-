"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast-simple";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Administrative console unlocked.",
          variant: "success",
        });
        router.push("/admin/dashboard");
      } else {
        toast({
          title: "Access Denied",
          description: result.error || "Invalid credentials.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "Failed to authenticate.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@milkymushrooms.com");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="bg-card border border-border/80 w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Milky Mushrooms Farm
            </span>
            <h1 className="text-2xl font-black text-foreground font-outfit mt-0.5">
              Admin Console Login
            </h1>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              Authorization required to access the farm metrics dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@milkymushrooms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md mt-2"
          >
            {submitting ? "Verifying..." : "Authenticate"}
          </button>
        </form>

        <div className="border-t border-border/60 pt-4 flex flex-col gap-2.5 text-center">
          <p className="text-[10px] text-muted-foreground leading-normal">
            For local evaluation, use the seed credentials:
          </p>
          <button
            onClick={handleQuickFill}
            className="w-full py-2 border border-border bg-muted/30 hover:bg-muted text-foreground text-[10px] font-bold rounded-lg transition-colors"
          >
            Quick Fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
