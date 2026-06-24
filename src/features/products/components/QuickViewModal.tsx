"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Plus, Minus, ShieldCheck, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    // Redirect to checkout path directly
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard?checkout=true";
    }
  };

  const isFavorite = isInWishlist(product.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 cursor-pointer backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 md:bg-muted md:hover:bg-muted/80 text-white md:text-muted-foreground md:hover:text-foreground rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Product Image Section */}
              <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-[400px] bg-secondary">
                <Image
                  src={getProductImageUrl(product.image)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                
                {/* Wishlist overlay */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-4 left-4 p-2.5 rounded-full shadow-lg transition-colors z-10 ${
                    isFavorite 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-white/80 dark:bg-black/60 text-foreground hover:bg-white dark:hover:bg-black"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Product Info Section */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    {product.category} Mushroom
                  </span>
                  <h3 className="font-extrabold text-xl md:text-2xl mt-1 text-foreground leading-tight">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-2xl text-primary">₹{product.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      / 250g pack
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4 leading-relaxed line-clamp-4 md:line-clamp-none">
                    {product.description}
                  </p>

                  {/* Nutrition panel if available */}
                  {product.nutrition && (Object.keys(product.nutrition).length > 0) && (
                    <div className="mt-5 p-4 bg-muted/40 dark:bg-muted/15 rounded-xl border border-border/40">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-2">
                        Nutrition Facts (per 100g)
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {product.nutrition.calories && (
                          <div className="bg-card py-1.5 px-2 rounded-lg border border-border/30">
                            <p className="text-muted-foreground scale-90">Energy</p>
                            <p className="font-extrabold text-foreground">{product.nutrition.calories}</p>
                          </div>
                        )}
                        {product.nutrition.protein && (
                          <div className="bg-card py-1.5 px-2 rounded-lg border border-border/30">
                            <p className="text-muted-foreground scale-90">Protein</p>
                            <p className="font-extrabold text-primary">{product.nutrition.protein}</p>
                          </div>
                        )}
                        {product.nutrition.carbohydrates && (
                          <div className="bg-card py-1.5 px-2 rounded-lg border border-border/30">
                            <p className="text-muted-foreground scale-90">Carbs</p>
                            <p className="font-extrabold text-foreground">{product.nutrition.carbohydrates}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {/* Stock and Quantity Select */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {product.stock > 0 ? `${product.stock} packs left in stock` : "Out of stock"}
                    </span>

                    {product.stock > 0 && (
                      <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 text-sm font-extrabold text-foreground">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 mt-2">
                    {product.stock > 0 ? (
                      <>
                        <button
                          onClick={handleAddToCart}
                          className="flex-1 py-3 bg-secondary text-secondary-foreground font-bold text-sm rounded-xl hover:bg-secondary/80 flex items-center justify-center gap-2 transition-all"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={handleBuyNow}
                          className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 text-center shadow-md shadow-primary/15 transition-all"
                        >
                          Buy Now
                        </button>
                      </>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-muted text-muted-foreground font-bold text-sm rounded-xl cursor-not-allowed text-center"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
export default QuickViewModal;
