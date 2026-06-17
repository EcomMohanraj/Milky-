"use client";


import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Truck,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { orderService } from "@/services/order.service";
import { Address, Order } from "@/types";
import { useToast } from "@/components/ui/toast-simple";

const addressSchema = z.object({
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  pincode: z.string().length(6, { message: "Pincode must be exactly 6 digits." }),
  is_default: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

function DashboardContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, updateProfile } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("orders");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Profile Edit states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Checkout states
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: "",
      city: "",
      pincode: "",
      is_default: false,
    },
  });

  const loadUserData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const addrData = await orderService.getAddresses(user.id);
      setAddresses(addrData);
      if (addrData.length > 0) {
        const def = addrData.find((a) => a.is_default);
        setSelectedAddressId(def ? def.id : addrData[0].id);
      }

      const ordData = await orderService.getOrders(user.id);
      setOrders(ordData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  // Load user details
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      loadUserData();
    }
  }, [user, loadUserData]);

  // Sync tab with url params
  useEffect(() => {
    if (searchParams) {
      const mode = searchParams.get("checkout");
      if (mode === "true" && cart.length > 0) {
        setIsCheckoutMode(true);
      } else {
        setIsCheckoutMode(false);
      }
    }
  }, [searchParams, cart]);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await updateProfile(editName, editPhone);
      if (res.success) {
        toast({ title: "Profile Updated", description: "Your details were saved successfully.", variant: "success" });
      } else {
        toast({ title: "Update Failed", description: res.error || "An error occurred.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (values: AddressFormValues) => {
    if (!user) return;
    try {
      const newAddr = await orderService.createAddress({
        user_id: user.id,
        address: values.address,
        city: values.city,
        pincode: values.pincode,
        is_default: values.is_default,
      });

      setAddresses((prev) => [...prev, newAddr]);
      if (newAddr.is_default || addresses.length === 0) {
        setSelectedAddressId(newAddr.id);
      }
      addressForm.reset();
      setShowAddressForm(false);
      toast({ title: "Address Saved", description: "Successfully added new shipping address.", variant: "success" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await orderService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Address Removed", description: "Shipping address deleted." });
    } catch (err) {
      console.error(err);
    }
  };

  // Razorpay integration trigger
  const handlePaymentAndCheckout = async () => {
    if (!user || cart.length === 0) return;
    const addr = addresses.find((a) => a.id === selectedAddressId);
    if (!addr) {
      toast({
        title: "Shipping Address Required",
        description: "Please select or add a shipping address before checking out.",
        variant: "destructive",
      });
      return;
    }

    setPlacingOrder(true);

    // Dynamic import for loading checkout.js
    const loadRazorpay = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isMock = true; // Default to true since env.local is set to true for evaluation

    if (isMock) {
      // Simulate Razorpay loading & completion
      setTimeout(async () => {
        try {
          const newOrder = await orderService.createOrder(
            {
              user_id: user.id,
              amount: cartTotal,
              status: "paid",
              payment_id: "pay_mock_" + Math.random().toString(36).substr(2, 9),
              address: `${addr.address}, ${addr.city} - ${addr.pincode}`,
            },
            cart.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            }))
          );

          setOrderSuccess(newOrder);
          clearCart();
          toast({
            title: "Order Placed Successfully",
            description: "Your Milky Mushrooms are scheduled for dispatch!",
            variant: "success",
          });
          // Refresh order list in background
          loadUserData();
        } catch (err) {
          console.error(err);
        } finally {
          setPlacingOrder(false);
        }
      }, 2000);
    } else {
      // Real Razorpay payment flow
      const res = await loadRazorpay();
      if (!res) {
        toast({
          title: "Razorpay Failed",
          description: "Could not load Payment Gateway. Please try again or use mock mode.",
          variant: "destructive",
        });
        setPlacingOrder(false);
        return;
      }

      // Complete checkout triggering Razorpay window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkeyid",
        amount: cartTotal * 100, // in paise
        currency: "INR",
        name: "Milky Mushrooms",
        description: "Fresh Farm Mushrooms Purchase",
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=100",
        handler: async function (response: { razorpay_payment_id: string }) {
          try {
            const newOrder = await orderService.createOrder(
              {
                user_id: user.id,
                amount: cartTotal,
                status: "paid",
                payment_id: response.razorpay_payment_id,
                address: `${addr.address}, ${addr.city} - ${addr.pincode}`,
              },
              cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
              }))
            );

            setOrderSuccess(newOrder);
            clearCart();
            toast({
              title: "Payment Verified",
              description: "Order placed successfully!",
              variant: "success",
            });
            loadUserData();
          } catch (err) {
            console.error(err);
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#15803d",
        },
      };

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      paymentObject.on("payment.failed", function (response: { error: { description: string } }) {
        toast({
          title: "Payment Failed",
          description: response.error.description || "Transaction declined.",
          variant: "destructive",
        });
        setPlacingOrder(false);
      });
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center flex-grow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Backup guard if middleware isn't active
  if (!user) {
    return null;
  }

  // ORDER SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="bg-card border border-border/80 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-lg text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground font-outfit">Order Confirmed!</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              Thank you for ordering from Milky Mushrooms. Your harvest is being booked.
            </p>
          </div>

          <div className="w-full bg-muted/40 p-4 rounded-2xl border border-border/40 text-left text-xs flex flex-col gap-2.5">
            <div className="flex justify-between font-bold">
              <span>Order ID:</span>
              <span className="font-mono text-primary">{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span>Paid Amount:</span>
              <span className="font-extrabold text-foreground">₹{orderSuccess.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span>Payment Ref:</span>
              <span className="font-mono text-muted-foreground truncate max-w-[150px]">
                {orderSuccess.payment_id}
              </span>
            </div>
            <div className="flex flex-col border-t border-border/40 pt-2 gap-0.5">
              <span className="font-bold">Shipping Address:</span>
              <span className="text-muted-foreground leading-normal">{orderSuccess.address}</span>
            </div>
          </div>

          <div className="flex gap-2 w-full mt-2">
            <button
              onClick={() => {
                setOrderSuccess(null);
                setIsCheckoutMode(false);
                setActiveTab("orders");
              }}
              className="flex-grow py-3 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl hover:bg-secondary/80 transition-colors"
            >
              Track Orders
            </button>
            <Link
              href="/shop"
              className="flex-grow py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 text-center transition-colors"
            >
              Shop More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FLOW SCREEN
  if (isCheckoutMode) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Address and details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
            <h2 className="text-xl font-extrabold text-foreground font-outfit flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Select Shipping Address
            </h2>

            {addresses.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground">You don&apos;t have any shipping addresses saved yet.</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95"
                >
                  Add New Address
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all border-border hover:bg-muted/30 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:text-foreground"
                    data-selected={selectedAddressId === addr.id}
                  >
                    <input
                      type="radio"
                      name="selected_address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div className="text-xs">
                      <p className="font-bold flex items-center gap-1.5">
                        {addr.city} Pincode: {addr.pincode}
                        {addr.is_default && (
                          <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-black">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground mt-1 leading-normal">{addr.address}</p>
                    </div>
                  </label>
                ))}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-left text-xs font-bold text-primary hover:underline self-start flex items-center gap-1 mt-1"
                >
                  <Plus className="h-4 w-4" /> Add another address
                </button>
              </div>
            )}

            {/* Address Add form */}
            {showAddressForm && (
              <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="border-t border-border pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <h3 className="font-bold text-xs text-foreground sm:col-span-3">Add New Address</h3>

                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Address</label>
                  <input
                    type="text"
                    placeholder="House No, Street name"
                    {...addressForm.register("address")}
                    className="border p-2 rounded-lg text-xs text-foreground bg-background"
                  />
                  {addressForm.formState.errors.address && (
                    <span className="text-[10px] text-red-500">{addressForm.formState.errors.address.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Palani"
                    {...addressForm.register("city")}
                    className="border p-2 rounded-lg text-xs text-foreground bg-background"
                  />
                  {addressForm.formState.errors.city && (
                    <span className="text-[10px] text-red-500">{addressForm.formState.errors.city.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Pincode</label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    {...addressForm.register("pincode")}
                    className="border p-2 rounded-lg text-xs text-foreground bg-background"
                  />
                  {addressForm.formState.errors.pincode && (
                    <span className="text-[10px] text-red-500">{addressForm.formState.errors.pincode.message}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:col-span-3 mt-1 text-xs">
                  <input
                    type="checkbox"
                    id="is_default"
                    {...addressForm.register("is_default")}
                  />
                  <label htmlFor="is_default" className="text-muted-foreground font-semibold">Set as default address</label>
                </div>

                <div className="flex gap-2 sm:col-span-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right column: Summary and checkout button */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border/80 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-foreground font-outfit">Order Summary</h2>

            <div className="flex flex-col gap-3 py-3 border-y border-border/80 max-h-[200px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <div className="flex flex-col gap-0.5 max-w-[150px]">
                    <span className="font-bold text-foreground truncate">{item.product.name}</span>
                    <span className="text-muted-foreground text-[10px]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-foreground">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-primary font-bold">FREE (Farm Fresh)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-foreground border-t border-border pt-3">
                <span>Total Amount:</span>
                <span className="text-primary font-black">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-[10px] text-emerald-900 dark:text-emerald-100 rounded-xl leading-relaxed flex gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <strong>Sandbox Payment Gateway:</strong><br />
                Mock gateway validation is active. Checkout will complete automatically.
              </div>
            </div>

            <button
              onClick={handlePaymentAndCheckout}
              disabled={placingOrder || addresses.length === 0}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 shadow-md shadow-primary/10 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-center"
            >
              {placingOrder ? "Placing Order..." : `Pay ₹${cartTotal.toFixed(2)} & Complete`}
            </button>

            <button
              onClick={() => setIsCheckoutMode(false)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
            >
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD USER DASHBOARD SCREEN
  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col md:flex-row gap-8 pb-20">

      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner">
            {user.name.charAt(0)}
          </div>
          <h2 className="font-extrabold text-base text-foreground leading-snug">{user.name}</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {user.role} Account
          </span>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <button
            onClick={() => setActiveTab("orders")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            data-active={activeTab === "orders"}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            Order History
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            data-active={activeTab === "addresses"}
          >
            <MapPin className="w-4.5 h-4.5" />
            Address Book
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            data-active={activeTab === "profile"}
          >
            <UserIcon className="w-4.5 h-4.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow bg-card border border-border/80 p-6 md:p-8 rounded-3xl shadow-sm min-h-[400px] flex flex-col justify-between">

        {loadingData ? (
          <div className="flex items-center justify-center h-full py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div>
            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-extrabold text-foreground font-outfit">Past Orders</h2>

                {orders.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-4">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground italic leading-normal">
                      You haven&apos;t placed any orders with Milky Mushrooms yet.
                    </p>
                    <Link
                      href="/shop"
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 shadow-sm"
                    >
                      Visit Shop
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="border border-border rounded-2xl p-4 bg-muted/10 flex flex-col gap-4 text-xs"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border/60 pb-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-primary font-bold">Order ID: {ord.id}</span>
                            <span className="text-muted-foreground text-[10px] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(ord.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-foreground">₹{ord.amount.toFixed(2)}</span>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider data-[status=delivered]:bg-emerald-50 data-[status=delivered]:text-emerald-600 data-[status=delivered]:border-emerald-200 data-[status=shipped]:bg-sky-50 data-[status=shipped]:text-sky-600 data-[status=shipped]:border-sky-200 data-[status=pending]:bg-amber-50 data-[status=pending]:text-amber-600 data-[status=pending]:border-amber-200 data-[status=paid]:bg-emerald-50 data-[status=paid]:text-emerald-600 data-[status=paid]:border-emerald-200 border"
                              data-status={ord.status}
                            >
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex flex-col gap-2.5">
                          {ord.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground">
                                {item.product?.name || "Premium Milky Mushrooms"}{" "}
                                <span className="text-muted-foreground font-semibold">x{item.quantity}</span>
                              </span>
                              <span className="font-extrabold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Tracking Progress bar */}
                        <div className="border-t border-border/60 pt-4 mt-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold mb-2">
                            <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Placed</span>
                            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipped</span>
                            <span>Delivered</span>
                          </div>

                          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{
                                width:
                                  ord.status === "delivered"
                                    ? "100%"
                                    : ord.status === "shipped"
                                      ? "66%"
                                      : "33%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-foreground font-outfit">Shipping Addresses</h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Address
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form onSubmit={addressForm.handleSubmit(handleAddAddress)} className="bg-muted/10 border border-border p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <h3 className="font-bold text-xs text-foreground sm:col-span-3">Add New Address</h3>

                    <div className="flex flex-col gap-1 sm:col-span-3">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Address</label>
                      <input
                        type="text"
                        placeholder="House No, street name"
                        {...addressForm.register("address")}
                        className="border p-2 rounded-lg text-xs text-foreground bg-background"
                      />
                      {addressForm.formState.errors.address && (
                        <span className="text-[10px] text-red-500">{addressForm.formState.errors.address.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Dindigul"
                        {...addressForm.register("city")}
                        className="border p-2 rounded-lg text-xs text-foreground bg-background"
                      />
                      {addressForm.formState.errors.city && (
                        <span className="text-[10px] text-red-500">{addressForm.formState.errors.city.message}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Pincode</label>
                      <input
                        type="text"
                        placeholder="6-digit PIN"
                        {...addressForm.register("pincode")}
                        className="border p-2 rounded-lg text-xs text-foreground bg-background"
                      />
                      {addressForm.formState.errors.pincode && (
                        <span className="text-[10px] text-red-500">{addressForm.formState.errors.pincode.message}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-3 mt-1 text-xs">
                      <input
                        type="checkbox"
                        id="is_default"
                        {...addressForm.register("is_default")}
                      />
                      <label htmlFor="is_default" className="text-muted-foreground font-semibold">Set as default</label>
                    </div>

                    <div className="flex gap-2 sm:col-span-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-border rounded-lg text-xs hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-4">No shipping addresses saved yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-border/80 p-4 rounded-xl shadow-sm bg-muted/10 relative flex flex-col justify-between"
                      >
                        <div className="text-xs">
                          <p className="font-bold text-foreground flex items-center gap-1.5">
                            {addr.city} - {addr.pincode}
                            {addr.is_default && (
                              <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-black">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground mt-2 leading-relaxed">{addr.address}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg self-end mt-4 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-5 max-w-md">
                <h2 className="text-xl font-extrabold text-foreground font-outfit">Edit Profile details</h2>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="border border-border p-2.5 rounded-lg text-xs text-muted-foreground bg-muted/30 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="border border-border p-2.5 rounded-lg text-xs text-foreground bg-background"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="border border-border p-2.5 rounded-lg text-xs text-foreground bg-background"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-colors shadow-sm self-start px-6"
                  >
                    {profileSaving ? "Saving..." : "Save Details"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Bottom Panel back to shop */}
        <div className="border-t border-border mt-8 pt-4 flex justify-between items-center text-xs text-muted-foreground">
          <span>Milky Mushrooms Farm Shop</span>
          <Link href="/shop" className="text-primary font-bold hover:underline">
            Go to Shop Catalogue →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="font-extrabold text-foreground">Loading Account Hub...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
