"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle } from "lucide-react";
import { apiFetch } from "@/services/api-client";

interface OrderTracking {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  items: {
    name: string;
    quantity: number;
  }[];
}

const STAGES = ["pending", "confirmed", "processing", "packed", "shipped", "delivered"];

const STAGE_METADATA: Record<string, { label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", description: "Order received, waiting verification", icon: Clock },
  confirmed: { label: "Confirmed", description: "Order accepted by our farm operators", icon: CheckCircle2 },
  processing: { label: "Processing", description: "Mushroom harvest selection in progress", icon: RefreshCwPlaceholder },
  packed: { label: "Packed", description: "Safely sealed in eco-friendly cold packages", icon: PackageCheck },
  shipped: { label: "Shipped", description: "Handed over to local courier delivery network", icon: Truck },
  delivered: { label: "Delivered", description: "Arrived at your shipping address destination", icon: CheckCircle2 },
};

// Simple icon replacement helper for processing
function RefreshCwPlaceholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderTracking | null>(null);

  const fetchTracking = async (id: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await apiFetch(`/api/orders/track/${id}`);
      if (res.ok) {
        setOrder(await res.json());
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Order not found. Please double-check the Order ID.");
      }
    } catch (err) {
      console.error(err);
      setError("A connection error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      fetchTracking(orderId.trim());
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id");
      if (queryId) {
        setOrderId(queryId);
        fetchTracking(queryId);
      }
    }
  }, []);


  // Determine active stage index
  const currentStatus = order?.status.toLowerCase() || "";
  const activeIndex = STAGES.indexOf(currentStatus);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center gap-8 min-h-[calc(100vh-280px)]">
      {/* Header */}
      <div className="text-center max-w-lg flex flex-col gap-2">
        <h1 className="text-3xl font-black text-foreground font-outfit">Track Your Order</h1>
        <p className="text-xs text-muted-foreground leading-normal">
          Enter the Order ID provided in your purchase confirmation to check the live status of your fresh organic mushrooms.
        </p>
      </div>

      {/* Tracker search bar */}
      <form onSubmit={handleTrack} className="w-full max-w-lg flex gap-2">
        <input
          type="text"
          placeholder="Enter Order ID (e.g. 7f2010...)"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono font-semibold"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 flex items-center gap-1.5 transition-all disabled:opacity-60 shrink-0"
        >
          <Search className="w-4 h-4" />
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {/* Loading Skeletons */}
      {loading && (
        <div className="w-full max-w-2xl bg-card border border-border p-6 rounded-3xl animate-pulse flex flex-col gap-6">
          <div className="h-4 bg-muted w-1/3 rounded" />
          <div className="h-24 bg-muted w-full rounded-2xl" />
          <div className="h-10 bg-muted w-2/3 rounded-xl" />
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="w-full max-w-lg bg-red-50 dark:bg-red-950/10 border border-red-200/40 dark:border-red-950/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Track results */}
      {order && (
        <div className="w-full max-w-2xl bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-8">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/60 pb-5 gap-4">
            <div className="text-xs flex flex-col gap-0.5">
              <span className="font-mono text-muted-foreground">Order ID: <span className="font-bold text-foreground">{order.id}</span></span>
              <span className="text-muted-foreground mt-0.5">Ordered Date: <span className="font-bold text-foreground">{new Date(order.created_at).toLocaleDateString()}</span></span>
            </div>
            <div className="text-xs sm:text-right flex flex-col gap-0.5">
              <span className="text-muted-foreground">Total Price: <span className="font-black text-foreground">₹{order.amount.toFixed(2)}</span></span>
              <span className="text-muted-foreground mt-0.5">Status: <span className="font-black text-primary uppercase">{order.status}</span></span>
            </div>
          </div>

          {/* Timeline workflow */}
          <div className="flex flex-col gap-6">
            <p className="font-black text-[10px] uppercase text-muted-foreground tracking-wider mb-2">Logistics Milestones</p>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-4">
              {/* Connector line for large screens */}
              <div className="hidden md:block absolute left-[30px] right-[30px] top-[24px] h-[3px] bg-muted -z-10 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-700"
                  style={{ width: activeIndex >= 0 ? `${(activeIndex / (STAGES.length - 1)) * 100}%` : "0%" }}
                />
              </div>

              {STAGES.map((stageName, idx) => {
                const metadata = STAGE_METADATA[stageName] || { label: stageName, description: "", icon: Clock };
                const StageIcon = metadata.icon;
                const isCompleted = idx <= activeIndex;
                const isActive = idx === activeIndex;

                return (
                  <div key={stageName} className="flex md:flex-col items-center gap-4 md:text-center md:flex-1 relative">
                    {/* Circle Pin */}
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-inner shrink-0 ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted/30 border-border text-muted-foreground"
                      } ${isActive ? "ring-4 ring-primary/20 scale-105" : ""}`}
                    >
                      <StageIcon className="w-5 h-5" />
                    </div>

                    {/* Metadata text details */}
                    <div className="text-xs text-left md:text-center">
                      <p className={`font-black ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{metadata.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal md:max-w-[120px] mx-auto">{metadata.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered items listing */}
          <div className="border-t border-border/60 pt-6 flex flex-col gap-4 text-xs">
            <p className="font-black text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-primary" /> Purchased Items
            </p>
            <div className="grid grid-cols-1 gap-2 bg-muted/20 border border-border/40 p-4 rounded-2xl">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs font-semibold py-1">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
