"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, RefreshCw } from "lucide-react";
import { apiFetch } from "@/services/api-client";
import { useToast } from "@/components/ui/toast-simple";

interface StoreSettings {
  storeName: string;
  contactNumber: string;
  email: string;
  deliveryCharges: number;
  taxPercentage: number;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "Milky Mushrooms",
    contactNumber: "+91 99887 76655",
    email: "contact@milkymushrooms.com",
    deliveryCharges: 50.0,
    taxPercentage: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          storeName: data.storeName,
          contactNumber: data.contactNumber,
          email: data.email,
          deliveryCharges: Number(data.deliveryCharges),
          taxPercentage: Number(data.taxPercentage),
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Store settings updated successfully!" });
      } else {
        toast({ title: "Error", description: "Failed to update store settings.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Network Error", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <Settings className="w-4 h-4" />
            Configuration Manager
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Store Settings
          </h1>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Settings"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="max-w-2xl bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-6 text-xs">
          {/* Store Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-foreground">Store Name</label>
            <input
              type="text"
              required
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-foreground">Contact Phone Number</label>
              <input
                type="text"
                required
                value={settings.contactNumber}
                onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-foreground">Contact Email Address</label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>

          {/* Pricing Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-foreground">Base Delivery Charge (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={settings.deliveryCharges}
                onChange={(e) => setSettings({ ...settings, deliveryCharges: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-foreground">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={settings.taxPercentage}
                onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
