"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Heart, Sparkles, RefreshCw } from "lucide-react";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import ProductCard from "@/features/products/components/ProductCard";
import { useCart } from "@/contexts/CartContext";

// We wrapper the shop component in a Suspense block because it accesses useSearchParams
function ShopContent() {
  const searchParams = useSearchParams();
  const { wishlist } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);

  const categories = ["All", "Fresh", "Dried", "Spawn", "Powder"];

  // Load products
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to load products: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle initial query parameters
  useEffect(() => {
    if (searchParams) {
      const catParam = searchParams.get("category");
      if (catParam) {
        setSelectedCategory(catParam);
      }
      
      const wishParam = searchParams.get("wishlist");
      if (wishParam === "true") {
        setShowWishlistOnly(true);
      }
    }
  }, [searchParams]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    // Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Wishlist filter
    if (showWishlistOnly) {
      const wishlistIds = wishlist.map((item) => item.id);
      result = result.filter((p) => wishlistIds.includes(p.id));
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, sortBy, showWishlistOnly, products, wishlist]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("featured");
    setShowWishlistOnly(false);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          Farm Fresh Catalogue
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-outfit">
          Explore Our Products
        </h1>
        <p className="text-sm text-muted-foreground">
          Premium organic Milky Mushrooms harvested daily. Safe, fresh, and direct.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 mb-8 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fresh mushrooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter categories & parameters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Sort Select */}
          <div className="flex items-center gap-2 border border-border bg-background rounded-xl px-3 py-1.5 shrink-0">
            <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Wishlist Toggle */}
          <button
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 bg-background text-muted-foreground border-border hover:text-foreground data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:border-red-500 data-[active=true]:shadow-sm"
            data-active={showWishlistOnly}
          >
            <Heart className={`h-4 w-4 ${showWishlistOnly ? "fill-current" : ""}`} />
            Wishlist ({wishlist.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow">
        {/* Sidebar Categories (Desktop) */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground mb-4">
              Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
                    data-active={isActive}
                  >
                    {cat} Mushrooms
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm text-xs leading-relaxed text-muted-foreground">
            <h4 className="font-bold text-foreground mb-2">Delivery Note:</h4>
            We harvest Milky Mushrooms fresh in the morning. Orders placed before 8:00 AM are dispatched on the same day.
          </div>
        </div>

        {/* Mobile Categories Scrollbar */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mt-4 mb-4 scrollbar-none w-full shrink-0">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border bg-card text-muted-foreground border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary data-[active=true]:shadow-sm"
                data-active={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="lg:col-span-3 flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-card border border-border animate-pulse rounded-2xl h-[380px]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-5 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-foreground">No Products Found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  We couldn&apos;t find any products matching your selected search or filters. Try adjusting your settings!
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 flex items-center gap-2 shadow-sm transition-colors"
              >
                <RefreshCw className="h-4.5 w-4.5" />
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="font-extrabold text-foreground">Loading Catalogue...</div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
