"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  BarChart3,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
} from "lucide-react";
import { apiFetch } from "@/services/api-client";

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    ordersToday: number;
    ordersThisMonth: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  topSellingProducts: {
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }[];
  customerGrowth: { month: string; count: number }[];
  topCustomers: {
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/analytics");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const { metrics, monthlyRevenue, topSellingProducts, customerGrowth, topCustomers } = data;

  // Monthly Revenue Chart Settings (SVG Bar Chart)
  const chartW = 500;
  const chartH = 180;
  const chartPadding = 35;
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1000);

  // Customer Growth Chart Settings (SVG Line Chart)
  const growthW = 500;
  const growthH = 180;
  const growthPadding = 35;
  const maxGrowth = Math.max(...customerGrowth.map((cg) => cg.count), 10);

  const growthPoints = customerGrowth
    .map((cg, index) => {
      const x = growthPadding + (index * (growthW - 2 * growthPadding)) / (customerGrowth.length - 1);
      const y = growthH - growthPadding - (cg.count * (growthH - 2 * growthPadding)) / maxGrowth;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <BarChart3 className="w-4 h-4" />
            Financial Intelligence
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Store Performance & Analytics
          </h1>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Store Revenue</p>
            <p className="font-extrabold text-xl text-foreground mt-1">₹{metrics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Lifetime Orders</p>
            <p className="font-extrabold text-xl text-foreground mt-1">{metrics.totalOrders}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Unique Customers</p>
            <p className="font-extrabold text-xl text-foreground mt-1">{metrics.totalCustomers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Product Types</p>
            <p className="font-extrabold text-xl text-foreground mt-1">{metrics.totalProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Package className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Monthly Revenue Trends</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Historical breakdown of monthly gross sales</p>
          </div>

          <div className="relative w-full h-[180px] mt-2">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
              {/* Lines */}
              <line x1={chartPadding} y1={chartPadding} x2={chartW - chartPadding} y2={chartPadding} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={chartPadding} y1={chartH / 2} x2={chartW - chartPadding} y2={chartH / 2} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={chartPadding} y1={chartH - chartPadding} x2={chartW - chartPadding} y2={chartH - chartPadding} stroke="currentColor" className="text-border" strokeWidth="1" />

              {monthlyRevenue.map((m, idx) => {
                const totalBars = monthlyRevenue.length;
                const barWidth = ((chartW - 2 * chartPadding) / totalBars) * 0.6;
                const gap = ((chartW - 2 * chartPadding) / totalBars) * 0.4;
                const x = chartPadding + idx * (barWidth + gap) + gap / 2;
                const barHeight = (m.revenue * (chartH - 2 * chartPadding)) / maxMonthlyRevenue;
                const y = chartH - chartPadding - barHeight;

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      className="fill-primary/90 hover:fill-primary transition-colors cursor-pointer"
                    />
                    <text x={x + barWidth / 2} y={chartH - 12} className="fill-muted-foreground text-[8px] font-bold" textAnchor="middle">
                      {m.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Customer Growth Line Chart */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Customer Base Growth</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Cumulative registered client accounts growth timeline</p>
          </div>

          <div className="relative w-full h-[180px] mt-2">
            <svg viewBox={`0 0 ${growthW} ${growthH}`} className="w-full h-full overflow-visible">
              <line x1={growthPadding} y1={growthPadding} x2={growthW - growthPadding} y2={growthPadding} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={growthPadding} y1={growthH / 2} x2={growthW - growthPadding} y2={growthH / 2} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={growthPadding} y1={growthH - growthPadding} x2={growthW - growthPadding} y2={growthH - growthPadding} stroke="currentColor" className="text-border" strokeWidth="1" />

              {growthPoints && (
                <polygon
                  fill="url(#growthGrad)"
                  points={`${growthPadding},${growthH - growthPadding} ${growthPoints} ${growthW - growthPadding},${growthH - growthPadding}`}
                />
              )}

              {growthPoints && (
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="3.5"
                  points={growthPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              <text x={growthPadding} y={growthH - 12} className="fill-muted-foreground text-[8px] font-bold" textAnchor="start">
                {customerGrowth[0]?.month}
              </text>
              <text x={growthW - growthPadding} y={growthH - 12} className="fill-muted-foreground text-[8px] font-bold" textAnchor="end">
                {customerGrowth[customerGrowth.length - 1]?.month}
              </text>

              <defs>
                <linearGradient id="growthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary, #10b981)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-primary, #10b981)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Products Leaderboard */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Top Selling Products</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Products sorted by overall unit volume sold</p>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-1">Product Name</th>
                  <th className="py-2.5 px-1">Category</th>
                  <th className="py-2.5 px-1 text-center">Units Sold</th>
                  <th className="py-2.5 px-1 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map((p, idx) => (
                  <tr key={idx} className="border-b border-border/60 hover:bg-muted/5">
                    <td className="py-3 px-1 font-bold text-foreground">{p.name}</td>
                    <td className="py-3 px-1 text-muted-foreground">{p.category}</td>
                    <td className="py-3 px-1 text-center font-bold text-foreground">{p.quantity}</td>
                    <td className="py-3 px-1 text-right font-extrabold text-primary">₹{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spending Customers */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Top Customers</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Purchasing clients ranked by total monetary value spent</p>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-1">Customer</th>
                  <th className="py-2.5 px-1 font-mono">Phone</th>
                  <th className="py-2.5 px-1 text-center">Orders</th>
                  <th className="py-2.5 px-1 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, idx) => (
                  <tr key={idx} className="border-b border-border/60 hover:bg-muted/5">
                    <td className="py-3 px-1">
                      <p className="font-bold text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.email}</p>
                    </td>
                    <td className="py-3 px-1 text-muted-foreground font-mono">{c.phone}</td>
                    <td className="py-3 px-1 text-center font-bold text-foreground">{c.orderCount}</td>
                    <td className="py-3 px-1 text-right font-extrabold text-foreground">₹{c.totalSpent.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
