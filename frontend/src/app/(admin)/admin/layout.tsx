"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Manage Products", href: "/admin/products", icon: Package },
    { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Manage Customers", href: "/admin/customers", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // Skip showing sidebar on login screen
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden w-full border-b border-border bg-card px-4 py-3 flex justify-between items-center z-30">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-md">
            M
          </div>
          <span className="font-extrabold text-sm tracking-tight text-primary">
            Milky<span className="text-foreground font-medium">Console</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 flex flex-col p-5 shadow-2xl md:hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-muted text-muted-foreground rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 flex-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 font-bold text-xs rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 flex items-center justify-center gap-2 border border-red-200/40 dark:border-red-950/30 transition-colors mt-auto"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6 min-h-screen shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2 mb-8 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-md">
            M
          </div>
          <span className="font-extrabold text-lg tracking-tight text-primary">
            Milky<span className="text-foreground font-medium">Console</span>
          </span>
        </Link>

        {user && (
          <div className="bg-muted/40 p-4 rounded-2xl mb-6 border border-border/40 text-center flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-extrabold text-xs text-foreground leading-snug">{user.name}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">Admin Account</p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1.5 flex-grow">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 font-bold text-xs rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 flex items-center justify-center gap-2 border border-red-200/40 dark:border-red-950/30 transition-colors mt-auto"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
