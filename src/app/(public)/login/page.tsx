"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast-simple";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone must be at least 10 digits." }),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register: signUp } = useAuth();
  const { toast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  
  // Status messages from URL
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (searchParams) {
      if (searchParams.get("verified") === "true") {
        setSuccessMessage("Email verified successfully! You can now log in.");
        setErrorMessage(null);
      }
      const err = searchParams.get("error");
      if (err) {
        setErrorMessage(decodeURIComponent(err));
        setSuccessMessage(null);
      }
    }
  }, [searchParams]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await login(values.email, values.password);
      if (res.success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        router.push("/dashboard");
      } else {
        setErrorMessage(res.error || "Wrong email/password.");
        toast({ title: "Authentication Failed", description: res.error || "Wrong email/password", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setVerificationToken(null);
    try {
      const res = await signUp(values.name, values.email, values.phone, values.password);
      if (res.success) {
        setVerificationToken(res.verificationToken || null);
        toast({ title: "Account Created!", description: "Verification email sent.", variant: "success" });
        registerForm.reset();
      } else {
        setErrorMessage(res.error || "Email already in use.");
        toast({ title: "Registration Failed", description: res.error || "Email already in use.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
      <div className="bg-card border border-border/80 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-lg">
        
        {/* Verification Success Notice */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold">Success</span>
              <p className="mt-0.5 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Verification / Authentication Error Notice */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <span className="font-bold">Error</span>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Local Email Verification Simulator */}
        {verificationToken ? (
          <div className="text-center flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shadow-inner">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-outfit">Simulating Verification Email</h2>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Your account was created! Because this is a local test database environment, we have generated a simulated email verification link.
              </p>
            </div>
            <a
              href={`/api/auth/verify-email?token=${verificationToken}`}
              className="w-full mt-2 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 text-center transition-all shadow-md flex items-center justify-center gap-2"
            >
              Verify Registered Account Now
            </a>
            <button
              onClick={() => {
                setVerificationToken(null);
                setIsRegistering(false);
              }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-primary">Secure Access</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground font-outfit mt-1">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {isRegistering ? "Join Milky Mushrooms to order fresh farm harvest" : "Sign in to manage addresses and orders"}
              </p>
            </div>

            {isRegistering ? (
              /* Register Form */
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      {...registerForm.register("name")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <span className="text-[10px] text-red-500">{registerForm.formState.errors.name.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      {...registerForm.register("email")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <span className="text-[10px] text-red-500">{registerForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Mobile number"
                      {...registerForm.register("phone")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {registerForm.formState.errors.phone && (
                    <span className="text-[10px] text-red-500">{registerForm.formState.errors.phone.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Min 4 characters"
                      {...registerForm.register("password")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <span className="text-[10px] text-red-500">{registerForm.formState.errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md mt-2 disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      {...loginForm.register("email")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <span className="text-[10px] text-red-500">{loginForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Password"
                      {...loginForm.register("password")}
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-xs bg-background focus:outline-none disabled:opacity-60 text-foreground"
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <span className="text-[10px] text-red-500">{loginForm.formState.errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md mt-2 disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            )}


            <div className="text-center mt-6 pt-4 border-t border-border/60">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setVerificationToken(null);
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 flex items-center justify-center flex-grow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
