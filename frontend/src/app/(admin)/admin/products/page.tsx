"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, RefreshCw, Package, X, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { useToast } from "@/components/ui/toast-simple";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form toggles
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [category, setCategory] = useState("Fresh");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Fresh", "Dried", "Spawn", "Powder"];

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setPrice(0);
    setStock(10);
    setCategory("Fresh");
    setCalories("");
    setProtein("");
    setEditingProduct(null);
  };

  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setDescription(prod.description);
    setImage(prod.image);
    setPrice(prod.price);
    setStock(prod.stock);
    setCategory(prod.category);
    setCalories(prod.nutrition?.calories || "");
    setProtein(prod.nutrition?.protein || "");
    setShowProductForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !description || !image) {
      toast({ title: "Form Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        description,
        image,
        price: Number(price),
        stock: Number(stock),
        category,
        nutrition: {
          calories: calories || undefined,
          protein: protein || undefined,
        },
      };

      const url = editingProduct ? `/api/products/${editingProduct.slug}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: editingProduct ? "Product Updated" : "Product Created",
          description: `${name} has been saved successfully.`,
          variant: "success",
        });
        resetForm();
        setShowProductForm(false);
        loadProducts();
      } else {
        toast({
          title: "Operation Failed",
          description: data.error || "Save error occurred.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Network Error", description: "Failed to submit form.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Are you sure you want to delete ${prod.name}?`)) return;

    try {
      const res = await fetch(`/api/products/${prod.slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Product Deleted", description: "Successfully removed product." });
        loadProducts();
      } else {
        toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
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
            <Package className="w-4 h-4" />
            Administrative Inventory Control
          </span>
          <h1 className="text-3xl font-extrabold text-foreground font-outfit mt-1">
            Store Catalogue
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowProductForm(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
          <button
            onClick={loadProducts}
            className="p-2 border border-border bg-card rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Catalogue Form Modal Overlay */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl p-6 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowProductForm(false);
                resetForm();
              }}
              className="absolute right-4 top-4 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-extrabold text-foreground font-outfit mb-4 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary" />
              {editingProduct ? "Modify Product Details" : "Create New Catalogue Entry"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Product Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Milky Cap"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Product Slug*</label>
                <input
                  type="text"
                  placeholder="url-slug-path"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Category*</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Price (₹)*</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Stock Quantity*</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  required
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Calories info</label>
                <input
                  type="text"
                  placeholder="e.g. 22 kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Protein info</label>
                <input
                  type="text"
                  placeholder="e.g. 3.1g"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Image URL (Unsplash or Supabase)*</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase">Product Description*</label>
                <textarea
                  placeholder="Detailed specifications, storage life..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="border p-2.5 rounded-lg bg-background text-foreground focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex gap-2.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95"
                >
                  {submitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalogue Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        {products.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center text-muted-foreground">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground italic">No products registered in the store catalogue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Stock packs</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} className="border-b border-border/60 hover:bg-muted/5 transition-colors">
                    <td className="py-3 px-2">
                      <div className="w-10 h-10 rounded overflow-hidden relative bg-secondary">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-foreground">{prod.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{prod.slug}</p>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{prod.category}</td>
                    <td className="py-3 px-2 font-extrabold text-foreground">₹{prod.price.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock < 10
                          ? "bg-red-500/10 text-red-500 font-extrabold"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
