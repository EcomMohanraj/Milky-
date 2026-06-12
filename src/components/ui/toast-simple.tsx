"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 3000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 md:p-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const isDestructive = t.variant === "destructive";
            const isSuccess = t.variant === "success";
            const isInfo = t.variant === "info";

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex gap-3 items-start p-4 rounded-xl shadow-lg border pointer-events-auto backdrop-blur-md ${
                  isDestructive
                    ? "bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100"
                    : isSuccess
                    ? "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100"
                    : isInfo
                    ? "bg-sky-50/95 dark:bg-sky-950/90 border-sky-200 dark:border-sky-900 text-sky-900 dark:text-sky-100"
                    : "bg-card/95 dark:bg-card/90 border-border text-foreground"
                }`}
              >
                <div className="flex-1 flex gap-2">
                  <div className="mt-0.5 shrink-0">
                    {isDestructive && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {isInfo && <Info className="w-5 h-5 text-sky-500" />}
                    {t.variant === "default" && <CheckCircle className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{t.title}</h4>
                    {t.description && (
                      <p className="text-xs mt-1 opacity-90 leading-normal">{t.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 text-foreground/50 hover:text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
