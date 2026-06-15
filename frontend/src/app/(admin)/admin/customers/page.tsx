"use client";

import React, { useEffect, useState } from "react";
import { Search, Users, Eye, Mail, Phone, Calendar, MapPin, RefreshCw, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/toast-simple";

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerDetails extends CustomerSummary {
  addresses: {
    id: string;
    address: string;
    city: string;
    pincode: string;
    isDefault: boolean;
  }[];
  orders: {
    id: string;
    amount: number;
    status: string;
    address: string;
    createdAt: string;
    items: {
      id: string;
      quantity: number;
      price: number;
      product?: {
        name: string;
        image: string;
      };
    }[];
  }[];
}

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail drawer states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        setFilteredCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (id: string) => {
    setLoadingDetails(true);
    setDetails(null);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      } else {
        toast({ title: "Error", description: "Failed to fetch customer profile details.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter list
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            (c.phone && c.phone.includes(query))
        )
      );
    }
  }, [searchQuery, customers]);

  const handleInspectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    loadCustomerDetails(id);
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
            <Users className="w-4 h-4" />
            Administrative Accounts Database
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Customers Directory
          </h1>
        </div>
        <button
          onClick={loadCustomers}
          className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table List */}
        <div className={`bg-card border border-border rounded-3xl p-6 shadow-sm ${selectedCustomerId ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-muted-foreground italic">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Orders Placed</th>
                    <th className="py-3 px-2">Total Spent</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="border-b border-border/60 hover:bg-muted/5 transition-colors">
                      <td className="py-3.5 px-2 font-bold text-foreground">{cust.name}</td>
                      <td className="py-3.5 px-2 text-muted-foreground">{cust.email}</td>
                      <td className="py-3.5 px-2 text-muted-foreground font-mono">{cust.phone || "—"}</td>
                      <td className="py-3.5 px-2 font-bold text-foreground text-center sm:text-left">{cust.orderCount}</td>
                      <td className="py-3.5 px-2 font-extrabold text-foreground">₹{cust.totalSpent.toFixed(2)}</td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => handleInspectCustomer(cust.id)}
                          className="p-1 hover:bg-muted text-primary rounded-lg transition-colors inline-flex items-center gap-1 font-bold"
                          title="Inspect Profile"
                        >
                          <Eye className="w-4 h-4" /> View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Profile History Panel */}
        {selectedCustomerId && (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-5 relative min-h-[400px]">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-xs font-bold"
            >
              Close
            </button>
            <h2 className="text-base font-extrabold text-foreground font-outfit">Customer Activity</h2>

            {loadingDetails && (
              <div className="flex-grow flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            )}

            {details && (
              <div className="flex flex-col gap-5 text-xs">
                {/* Contact Card */}
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{details.name}</h3>
                  <div className="flex flex-col gap-1.5 text-muted-foreground mt-2">
                    <span className="flex items-center gap-1.5"><Mail className="w-4.5 h-4.5 shrink-0" /> {details.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4.5 h-4.5 shrink-0" /> {details.phone || "—"}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4.5 h-4.5 shrink-0" /> Registered {new Date(details.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Addresses */}
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-foreground uppercase text-[9px] text-muted-foreground mb-2">Saved Shipping Addresses</p>
                  {details.addresses.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">No shipping addresses saved.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {details.addresses.map((a) => (
                        <div key={a.id} className="bg-muted/30 border border-border/40 p-2.5 rounded-xl text-[10px] relative">
                          <p className="font-bold flex items-center gap-1 text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            {a.city} Pincode: {a.pincode}
                            {a.isDefault && <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Default</span>}
                          </p>
                          <p className="text-muted-foreground mt-1 leading-normal">{a.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order History */}
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-foreground uppercase text-[9px] text-muted-foreground mb-2.5">Detailed Purchase History</p>
                  {details.orders.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">No purchases recorded yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
                      {details.orders.map((ord) => (
                        <div key={ord.id} className="border border-border/80 p-3 rounded-xl bg-muted/10 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono text-primary font-bold">{ord.id.substring(0, 8)}...</span>
                            <span className="font-bold uppercase tracking-wider text-[9px] text-muted-foreground">{ord.status}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            {ord.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-[10px] text-muted-foreground">
                                <span className="truncate max-w-[120px] font-semibold">{item.product?.name || "Product"}</span>
                                <span>qty: {item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-border/40 pt-1.5 flex justify-between items-center">
                            <span className="text-[9px] text-muted-foreground">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            <span className="font-extrabold text-foreground">₹{ord.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
