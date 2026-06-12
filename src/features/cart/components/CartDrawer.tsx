"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutClick?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckoutClick }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

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
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span>Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Your cart is empty</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Add fresh organic Milky Mushrooms from our shop to get started!
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="px-6 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/40 relative group"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 bg-secondary">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 80px) 100vw, 80px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          Category: {item.product.category}
                        </p>
                        <p className="text-sm font-extrabold text-primary mt-1">
                          ₹{item.product.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Subtotal</span>
                  <span className="font-extrabold text-xl text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                <p className="text-[10px] text-muted-foreground text-center">
                  Shipping and taxes calculated at checkout. Free farm-fresh delivery within our support areas!
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-secondary text-secondary-foreground font-bold text-sm rounded-xl hover:bg-secondary/80 text-center transition-all"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      if (onCheckoutClick) onCheckoutClick();
                      onClose();
                    }}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 text-center shadow-md shadow-primary/10 transition-all"
                  >
                    Checkout Now
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
