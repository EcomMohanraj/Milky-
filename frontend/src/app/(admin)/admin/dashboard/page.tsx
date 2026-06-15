"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Package,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Order } from "@/types";
import { apiFetch } from "@/services/api-client";

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    ordersToday: number;
    ordersThisMonth: number;
    lowStockCount: number;
  };
  lowStockProducts: {
    id: string;
    name: string;
    stock: number;
    category: string;
  }[];
  dailySales: { date: string; sales: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topSellingProducts: {
    name: string;
    quantity: number;
    revenue: number;
    category: string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        apiFetch("/api/analytics"),
        apiFetch("/api/orders"),
      ]);

      if (analyticsRes.ok) {
        setData(await analyticsRes.json());
      }
      if (ordersRes.ok) {
        const ords = await ordersRes.json();
        setRecentOrders(ords.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const { metrics, lowStockProducts, dailySales, topSellingProducts } = data;

  // Chart configuration for Daily Sales SVG
  const width = 600;
  const height = 180;
  const padding = 30;
  const maxSales = Math.max(...dailySales.map((d) => d.sales), 1000);

  const points = dailySales
    .map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / (dailySales.length - 1);
      const y = height - padding - (d.sales * (height - 2 * padding)) / maxSales;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <TrendingUp className="w-4 h-4" />
            Milky Mushrooms Farm Insights
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Metrics Overview
          </h1>
        </div>
        <button
          onClick={fetchData}
          className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Stats Counter Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-primary/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Revenue</p>
            <p className="font-extrabold text-lg md:text-xl text-foreground mt-0.5">
              ₹{metrics.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-primary/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Orders</p>
            <p className="font-extrabold text-lg md:text-xl text-foreground mt-0.5">{metrics.totalOrders}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-primary/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Customers</p>
            <p className="font-extrabold text-lg md:text-xl text-foreground mt-0.5">{metrics.totalCustomers}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-primary/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-inner shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Products</p>
            <p className="font-extrabold text-lg md:text-xl text-foreground mt-0.5">{metrics.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-[9px] uppercase font-bold text-muted-foreground">Orders Today</p>
          <p className="font-black text-xl text-foreground mt-1">{metrics.ordersToday}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-[9px] uppercase font-bold text-muted-foreground">Orders This Month</p>
          <p className="font-black text-xl text-foreground mt-1">{metrics.ordersThisMonth}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-[9px] uppercase font-bold text-muted-foreground">Low Stock alerts</p>
          <p className={`font-black text-xl mt-1 ${metrics.lowStockCount > 0 ? "text-red-500" : "text-foreground"}`}>
            {metrics.lowStockCount} items
          </p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-foreground font-outfit">Daily Sales (Last 30 Days)</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Timeline trends for paid and completed orders</p>
            </div>
            <Link href="/admin/analytics" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative w-full h-[180px] mt-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" className="text-border/40" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" />

              {/* Gradient area under polyline */}
              {points && (
                <polygon
                  fill="url(#grad)"
                  points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                />
              )}

              {/* The Line chart */}
              {points && (
                <polyline
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="3.5"
                  points={points}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Start and End labels */}
              <text x={padding} y={height - 10} className="fill-muted-foreground text-[8px] font-bold" textAnchor="start">
                {dailySales[0]?.date}
              </text>
              <text x={width - padding} y={height - 10} className="fill-muted-foreground text-[8px] font-bold" textAnchor="end">
                {dailySales[dailySales.length - 1]?.date}
              </text>

              {/* Gradients */}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary, #10b981)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-primary, #10b981)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Top Products distribution */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Top Selling Products</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Quantity ranking in completed orders</p>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="flex-grow flex items-center justify-center py-10 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground italic">No sales recorded.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-grow justify-center">
              {topSellingProducts.slice(0, 4).map((p, idx) => {
                const maxQty = Math.max(...topSellingProducts.map((item) => item.quantity), 1);
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-foreground">
                      <span className="truncate max-w-[130px]">{p.name}</span>
                      <span className="text-muted-foreground font-mono">{p.quantity} units</span>
                    </div>
                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-foreground font-outfit">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary hover:underline"
            >
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-2xl">
              <p className="text-xs text-muted-foreground italic">No orders received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">Order ID</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Amount</th>
                    <th className="py-2.5 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="border-b border-border/60 hover:bg-muted/10">
                      <td className="py-3 px-2 font-mono text-primary font-bold">{ord.id.substring(0, 8)}...</td>
                      <td className="py-3 px-2 text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 font-bold text-foreground">
                        {ord.customer?.name || "Guest Customer"}
                      </td>
                      <td className="py-3 px-2 font-extrabold text-foreground">₹{ord.amount.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ord.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : ord.status === "paid" || ord.status === "confirmed"
                            ? "bg-blue-500/10 text-blue-500"
                            : ord.status === "cancelled" || ord.status === "failed"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Low Stock Alerts */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-foreground font-outfit">Low Stock Alerts</h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-primary hover:underline"
            >
              Restock Catalogue
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-2xl text-center p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <Package className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground font-bold">All stocks stable</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">All products have more than 10 packs in store.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-grow">
              {lowStockProducts.map((prod) => (
                <div key={prod.id} className="border border-border/80 p-3 rounded-xl bg-muted/10 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{prod.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Category: {prod.category}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    prod.stock === 0
                      ? "bg-red-500/10 text-red-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {prod.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
