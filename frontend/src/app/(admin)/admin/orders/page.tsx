"use client";

import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal, ShoppingBag, Eye, RefreshCw } from "lucide-react";
import { Order } from "@/types";
import { useToast } from "@/components/ui/toast-simple";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setFilteredOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    let result = [...orders];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.customer?.name.toLowerCase().includes(query) ||
          o.customer?.email.toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== "all") {
      result = result.filter((o) => o.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    setFilteredOrders(result);
  }, [searchQuery, selectedStatus, orders]);

  const handleUpdateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        // Sync detailed view if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
        }

        toast({
          title: "Order Updated",
          description: `Order successfully set to ${status}.`,
          variant: "success",
        });
      } else {
        const errData = await res.json();
        toast({
          title: "Update Failed",
          description: errData.error || "Could not update status.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
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
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <ShoppingBag className="w-4 h-4" />
            Administrative Logistics
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Orders Management
          </h1>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 border border-border bg-background rounded-xl px-3 py-1.5 shrink-0 w-full sm:w-auto">
          <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer w-full"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table & Details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table List */}
        <div className={`bg-card border border-border rounded-3xl p-6 shadow-sm ${selectedOrder ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground italic">No orders match the search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Logistics Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="border-b border-border/60 hover:bg-muted/5 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-primary font-bold">{ord.id.substring(0, 8)}...</td>
                      <td className="py-3.5 px-2 text-muted-foreground">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-foreground">
                        {ord.customer?.name || "Guest Customer"}
                      </td>
                      <td className="py-3.5 px-2 font-extrabold text-foreground">₹{ord.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-2">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value as Order["status"])}
                          className="text-xs bg-background border border-border p-1 rounded-md focus:outline-none font-semibold text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1 hover:bg-muted text-primary rounded-lg transition-colors inline-flex items-center gap-1 font-bold"
                          title="Inspect Order Details"
                        >
                          <Eye className="w-4 h-4" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Drawer */}
        {selectedOrder && (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-5 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-xs font-bold"
            >
              Close
            </button>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Order Inspection</h2>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/40 flex flex-col gap-1 font-mono text-[10px]">
                <p className="font-bold text-foreground">ID: {selectedOrder.id}</p>
                <p className="text-muted-foreground">Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p className="text-muted-foreground">Gateway Ref: {selectedOrder.payment_id || "None"}</p>
              </div>

              <div>
                <p className="font-bold text-foreground uppercase text-[9px] text-muted-foreground">Customer Profile</p>
                <p className="font-bold text-sm text-foreground mt-0.5">
                  {selectedOrder.customer?.name || "Guest"}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.customer?.email || ""}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.customer?.phone || ""}
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="font-bold text-foreground uppercase text-[9px] text-muted-foreground">Shipping Address</p>
                <p className="text-foreground mt-1 leading-normal">{selectedOrder.address}</p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="font-bold text-foreground uppercase text-[9px] text-muted-foreground mb-2">Order Basket</p>
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                      <div className="max-w-[150px]">
                        <p className="font-bold truncate text-foreground">{item.product?.name || "Product"}</p>
                        <p className="text-[10px] text-muted-foreground">₹{item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <span className="font-extrabold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-muted-foreground text-[10px] uppercase">Final Amount</span>
                <span className="font-black text-base text-primary">₹{selectedOrder.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
