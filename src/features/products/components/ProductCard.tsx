"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Heart, ShieldAlert } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(getProductImageUrl(product.image));

  useEffect(() => {
    setImgSrc(getProductImageUrl(product.image));
  }, [product.image]);

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all"
      >
        {/* Product Image Wrapper */}
        <div className="relative aspect-square w-full bg-secondary overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNkMWZhZTUiLz48L3N2Zz4="
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 250px"
            onError={() => setImgSrc("/images/fresh_milky_mushrooms.webp")}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary text-primary-foreground rounded-full shadow-sm">
              {product.category}
            </span>
            {isOutOfStock && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500 text-white rounded-full flex items-center gap-1 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5" />
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Trigger */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-3 right-3 p-3 md:p-2 rounded-full shadow-md z-10 hover:scale-110 active:scale-95 transition-all ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/95 dark:bg-black/80 text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Image Hover Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="p-3 bg-white text-foreground rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </button>
            {!isOutOfStock && (
              <button
                onClick={() => addToCart(product, 1)}
                className="p-3 bg-white text-foreground rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                title="Add to Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <Link href={`/shop/${product.slug}`}>
              <h3 className="font-bold text-sm text-foreground hover:text-primary transition-colors leading-tight line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-foreground">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground">per 250g pack</span>
            </div>

            {!isOutOfStock ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="px-4 py-3 md:px-3.5 md:py-1.5 bg-primary text-primary-foreground text-sm md:text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-3 md:px-3 md:py-1.5 bg-muted text-muted-foreground text-sm md:text-xs font-semibold rounded-lg cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal Trigger */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};
export default ProductCard;
