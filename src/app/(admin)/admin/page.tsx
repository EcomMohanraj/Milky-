"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Star,
  Plus,
  Trash2,
  ShieldCheck,
  BookOpen,
  DollarSign,
  Lock,
  Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { productService } from "@/services/product.service";
import { orderService } from "@/services/order.service";
import { Order, Product, Review, BlogPost } from "@/types";
import { useToast } from "@/components/ui/toast-simple";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "reviews" | "coupons" | "blogs">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating products
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(10);
  const [prodCategory, setProdCategory] = useState("Fresh");
  const [prodCalories, setProdCalories] = useState("");
  const [prodProtein, setProdProtein] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Form states for creating blogs
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImg, setBlogImg] = useState("");
  const [submittingBlog, setSubmittingBlog] = useState(false);

  // Coupon states
  const [coupons, setCoupons] = useState<{ code: string; discount: number }[]>([
    { code: "MILKY10", discount: 10 },
    { code: "FRESH20", discount: 20 },
    { code: "FARMERFREE", discount: 100 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const pData = await productService.getProducts();
      setProducts(pData);

      const oData = await orderService.getOrders();
      setOrders(oData);

      const bData = await productService.getBlogPosts();
      setBlogs(bData);

      // Load all product reviews
      const allReviews: Review[] = [];
      for (const p of pData) {
        const revs = await productService.getReviews(p.id);
        allReviews.push(...revs);
      }
      setReviews(allReviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast({
        title: "Order Updated",
        description: `Order status successfully set to ${status}.`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSlug) return;
    setSubmittingProduct(true);
    try {
      const newP = await productService.addProduct({
        name: prodName,
        slug: prodSlug,
        description: prodDesc,
        image: prodImg || "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
        price: Number(prodPrice),
        stock: Number(prodStock),
        category: prodCategory,
        nutrition: {
          calories: prodCalories || "22 kcal",
          protein: prodProtein || "3.1g",
        },
      });

      setProducts((prev) => [newP, ...prev]);
      setShowProductForm(false);
      resetProductForm();
      toast({
        title: "Product Added",
        description: `${prodName} is now live in the shop catalogue.`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Product Deleted", description: "Successfully removed from shop catalogue." });
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setProdName("");
    setProdSlug("");
    setProdDesc("");
    setProdImg("");
    setProdPrice(0);
    setProdStock(10);
    setProdCategory("Fresh");
    setProdCalories("");
    setProdProtein("");
  };

  const handleAddBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogSlug) return;
    setSubmittingBlog(true);
    try {
      const newB = await productService.createBlogPost({
        title: blogTitle,
        slug: blogSlug,
        content: blogContent,
        image: blogImg || "https://images.unsplash.com/photo-1594911774802-8822a7079ae1?auto=format&fit=crop&q=80&w=600",
      });

      setBlogs((prev) => [newB, ...prev]);
      setShowBlogForm(false);
      setBlogTitle("");
      setBlogSlug("");
      setBlogContent("");
      setBlogImg("");
      toast({
        title: "Article Published",
        description: `Recipe "${blogTitle}" has been added to the blog.`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await productService.deleteBlogPost(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Article Removed", description: "Successfully deleted recipe post." });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons((prev) => [...prev, { code: newCouponCode.toUpperCase(), discount: Number(newCouponDiscount) }]);
    setNewCouponCode("");
    toast({ title: "Coupon Added", description: `Promo code ${newCouponCode.toUpperCase()} is active.`, variant: "success" });
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    toast({ title: "Coupon Deleted", description: "Promo code has been deactivated." });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center flex-grow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // AUTHORIZATION GUARD
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 flex-grow flex items-center justify-center">
        <div className="bg-card border border-border/80 w-full max-w-md p-8 rounded-3xl shadow-xl text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground font-outfit">Access Denied</h1>
            <p className="text-xs text-muted-foreground mt-1 leading-normal">
              Admin authorization is required to access this dashboard.
            </p>
          </div>
          <p className="text-xs text-muted-foreground bg-muted/40 p-4 rounded-xl leading-normal border border-border/40">
            Please log out and sign back in using our administrator testing account:<br />
            Email: <code className="font-semibold text-primary">admin@milky.com</code>
          </p>
          <Link
            href="/dashboard"
            className="w-full py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 text-center shadow-sm"
          >
            Go to Login Portal
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.status === "paid" || o.status === "delivered" ? o.amount : 0), 0);
  const totalOrders = orders.length;
  const productsCount = products.length;
  const avgReview = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col gap-8 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <ShieldCheck className="w-4 h-4" />
            Security Verified Administrative Console
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">Farm Admin Panel</h1>
        </div>
        <button
          onClick={loadAdminData}
          className="px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted text-foreground"
        >
          Sync Real-time Data
        </button>
      </div>

      {/* METRIC BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Sales</p>
            <p className="font-extrabold text-lg text-foreground mt-0.5">₹{totalSales.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Orders</p>
            <p className="font-extrabold text-lg text-foreground mt-0.5">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Products</p>
            <p className="font-extrabold text-lg text-foreground mt-0.5">{productsCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Avg Rating</p>
            <p className="font-extrabold text-lg text-foreground mt-0.5">{avgReview} / 5.0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <button
            onClick={() => setActiveTab("orders")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground border-none focus:outline-none"
            data-active={activeTab === "orders"}
          >
            <ShoppingBag className="w-4 h-4" />
            Manage Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground focus:outline-none"
            data-active={activeTab === "products"}
          >
            <Package className="w-4 h-4" />
            Manage Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground focus:outline-none"
            data-active={activeTab === "reviews"}
          >
            <Star className="w-4 h-4" />
            Reviews List ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground focus:outline-none"
            data-active={activeTab === "coupons"}
          >
            <Tag className="w-4 h-4" />
            Coupons / Promo
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className="w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center gap-2 border-t border-border/60 text-muted-foreground hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground focus:outline-none"
            data-active={activeTab === "blogs"}
          >
            <BookOpen className="w-4 h-4" />
            Recipe Blog Posts
          </button>
        </div>

        {/* Tab content area */}
        <div className="lg:col-span-4 bg-card border border-border p-6 rounded-3xl shadow-sm min-h-[450px]">
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div>
              {/* ORDERS MANAGEMENT */}
              {activeTab === "orders" && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-extrabold text-foreground font-outfit">Orders Management</h2>
                  {orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-8 text-center">No orders placed yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                            <th className="py-3 px-2">Order ID</th>
                            <th className="py-3 px-2">Date</th>
                            <th className="py-3 px-2">Address</th>
                            <th className="py-3 px-2">Amount</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord) => (
                            <tr key={ord.id} className="border-b border-border/60 hover:bg-muted/10">
                              <td className="py-3.5 px-2 font-mono text-primary font-bold">{ord.id}</td>
                              <td className="py-3.5 px-2 text-muted-foreground">
                                {new Date(ord.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-2 max-w-[150px] truncate text-muted-foreground" title={ord.address}>
                                {ord.address}
                              </td>
                              <td className="py-3.5 px-2 font-extrabold text-foreground">₹{ord.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-2">
                                <span className="font-bold uppercase text-[9px] text-primary">{ord.status}</span>
                              </td>
                              <td className="py-3.5 px-2 text-right">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order["status"])}
                                  className="text-xs bg-background border border-border p-1 rounded-md focus:outline-none"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="failed">Failed</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCTS MANAGEMENT */}
              {activeTab === "products" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-extrabold text-foreground font-outfit">Products Management</h2>
                    <button
                      onClick={() => setShowProductForm(!showProductForm)}
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Product
                    </button>
                  </div>

                  {showProductForm && (
                    <form onSubmit={handleAddProductSubmit} className="bg-muted/10 border border-border p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <h3 className="font-bold text-xs text-foreground sm:col-span-3">Add New Mushroom Product</h3>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Product Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Premium White Caps"
                          value={prodName}
                          onChange={(e) => {
                            setProdName(e.target.value);
                            setProdSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                          }}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Product Slug</label>
                        <input
                          type="text"
                          placeholder="slug-url-path"
                          value={prodSlug}
                          onChange={(e) => setProdSlug(e.target.value)}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Category</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        >
                          <option value="Fresh">Fresh</option>
                          <option value="Dried">Dried</option>
                          <option value="Spawn">Spawn</option>
                          <option value="Powder">Powder</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-3">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Description</label>
                        <textarea
                          placeholder="Detailed features..."
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                          required
                          rows={3}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Image URL (Unsplash/Supabase)</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={prodImg}
                          onChange={(e) => setProdImg(e.target.value)}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Price (₹)</label>
                        <input
                          type="number"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(Number(e.target.value))}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Stock Packs</label>
                        <input
                          type="number"
                          value={prodStock}
                          onChange={(e) => setProdStock(Number(e.target.value))}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Energy Calories</label>
                        <input
                          type="text"
                          placeholder="22 kcal"
                          value={prodCalories}
                          onChange={(e) => setProdCalories(e.target.value)}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Protein</label>
                        <input
                          type="text"
                          placeholder="3.1g"
                          value={prodProtein}
                          onChange={(e) => setProdProtein(e.target.value)}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="sm:col-span-3 flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            resetProductForm();
                          }}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingProduct}
                          className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95"
                        >
                          {submittingProduct ? "Saving..." : "Save Product"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Image</th>
                          <th className="py-3 px-2">Name</th>
                          <th className="py-3 px-2">Category</th>
                          <th className="py-3 px-2">Price</th>
                          <th className="py-3 px-2">Stock Packs</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => (
                          <tr key={prod.id} className="border-b border-border/60 hover:bg-muted/10">
                            <td className="py-2.5 px-2 shrink-0">
                              <div className="w-10 h-10 rounded overflow-hidden relative bg-secondary">
                                <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                              </div>
                            </td>
                            <td className="py-2.5 px-2 font-bold text-foreground">{prod.name}</td>
                            <td className="py-2.5 px-2 text-muted-foreground">{prod.category}</td>
                            <td className="py-2.5 px-2 font-extrabold text-foreground">₹{prod.price.toFixed(2)}</td>
                            <td className={`py-2.5 px-2 font-bold ${prod.stock < 10 ? "text-red-500" : "text-emerald-500"}`}>
                              {prod.stock} units
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* REVIEWS MANAGER */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-5">
                  <h2 className="text-lg font-extrabold text-foreground font-outfit">Product Reviews</h2>
                  {reviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-8 text-center">No reviews submitted yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="border border-border/80 p-4 rounded-xl bg-muted/10 text-xs flex justify-between items-start gap-4">
                          <div>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span className="font-bold text-foreground">{rev.user_name}</span>
                              <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex text-amber-500 font-bold my-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-sm">{i < rev.rating ? "★" : "☆"}</span>
                              ))}
                            </div>
                            <p className="text-muted-foreground mt-1 leading-normal italic">
                              &ldquo;{rev.comment}&rdquo;
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this review?")) return;
                              // Normally deletes from DB, here we slice local state
                              setReviews((prev) => prev.filter((r) => r.id !== rev.id));
                              toast({ title: "Review Deleted", description: "Successfully removed buyer comment." });
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COUPONS MANAGER */}
              {activeTab === "coupons" && (
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-extrabold text-foreground font-outfit">Active Coupons</h2>
                  
                  <form onSubmit={handleAddCoupon} className="flex flex-wrap gap-3 items-end border-b border-border pb-5">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. MILKY50"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="border p-2 rounded-lg bg-background text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase">Discount (%)</label>
                      <input
                        type="number"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                        className="border p-2 rounded-lg bg-background text-foreground focus:outline-none w-20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-1 shadow-sm"
                    >
                      Create Promo
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {coupons.map((c) => (
                      <div key={c.code} className="border border-border/80 p-4 rounded-xl bg-muted/10 flex justify-between items-center">
                        <div>
                          <p className="font-mono font-bold text-primary text-sm">{c.code}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{c.discount}% Discount off cart total</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECIPES BLOG MANAGER */}
              {activeTab === "blogs" && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-extrabold text-foreground font-outfit">Recipe Blog Posts</h2>
                    <button
                      onClick={() => setShowBlogForm(!showBlogForm)}
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Add Recipe Post
                    </button>
                  </div>

                  {showBlogForm && (
                    <form onSubmit={handleAddBlogSubmit} className="bg-muted/10 border border-border p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <h3 className="font-bold text-xs text-foreground sm:col-span-2">Write Recipe Blog Post</h3>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Recipe Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Mushroom Fry"
                          value={blogTitle}
                          onChange={(e) => {
                            setBlogTitle(e.target.value);
                            setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                          }}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Post Slug</label>
                        <input
                          type="text"
                          placeholder="url-slug-path"
                          value={blogSlug}
                          onChange={(e) => setBlogSlug(e.target.value)}
                          required
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Banner Image URL</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={blogImg}
                          onChange={(e) => setBlogImg(e.target.value)}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Recipe Content & Instructions</label>
                        <textarea
                          placeholder="Write prep guidelines..."
                          value={blogContent}
                          onChange={(e) => setBlogContent(e.target.value)}
                          required
                          rows={6}
                          className="border p-2 rounded-lg bg-background text-foreground"
                        />
                      </div>

                      <div className="sm:col-span-2 flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowBlogForm(false)}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingBlog}
                          className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95"
                        >
                          {submittingBlog ? "Publishing..." : "Publish Recipe"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Image</th>
                          <th className="py-3 px-2">Title</th>
                          <th className="py-3 px-2">Slug</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((b) => (
                          <tr key={b.id} className="border-b border-border/60 hover:bg-muted/10">
                            <td className="py-2 px-2">
                              <div className="w-10 h-8 rounded overflow-hidden relative bg-secondary">
                                <img src={b.image} alt={b.title} className="object-cover w-full h-full" />
                              </div>
                            </td>
                            <td className="py-2 px-2 font-bold text-foreground">{b.title}</td>
                            <td className="py-2 px-2 text-muted-foreground font-mono">{b.slug}</td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
