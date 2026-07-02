import React, { Suspense } from "react";
import { query, initDb } from "@/lib/db";
import { Product } from "@/types";
import ShopContent from "./ShopContent";

export const dynamic = "force-dynamic";

function ShopSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="h-4 bg-muted rounded w-28" />
        <div className="h-8 bg-muted rounded w-48 mt-2" />
        <div className="h-4 bg-muted rounded w-72 mt-2" />
      </div>

      {/* Control Bar Skeleton */}
      <div className="bg-muted/30 border border-border/80 rounded-2xl p-6 mb-8 h-20" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block h-64 bg-muted/20 rounded-2xl" />
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-muted/10 border border-border/40 rounded-2xl h-[380px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function ShopLoader() {
  let products: Product[] = [];
  let error: string | null = null;
  
  try {
    await initDb();
    const res = await query("SELECT * FROM public.products ORDER BY created_at DESC");
    products = res.rows as unknown as Product[];
  } catch (err) {
    console.error("Failed to load products on server:", err);
    error = err instanceof Error ? err.message : String(err);
  }

  return <ShopContent initialProducts={products} initialError={error} />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopLoader />
    </Suspense>
  );
}
