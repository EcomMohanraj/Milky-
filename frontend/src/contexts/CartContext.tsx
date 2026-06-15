"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem } from "@/types";
import { useToast } from "@/components/ui/toast-simple";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { toast } = useToast();

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("milky_cart");
      if (storedCart) setCart(JSON.parse(storedCart));
      
      const storedWishlist = localStorage.getItem("milky_wishlist");
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  // Sync to localStorage on updates
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("milky_cart", JSON.stringify(newCart));
  };

  const saveWishlist = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem("milky_wishlist", JSON.stringify(newWishlist));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const newCart = [...cart];

    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + quantity;
      if (product.stock > 0 && newQty > product.stock) {
        toast({
          title: "Out of Stock",
          description: `Cannot add more. Only ${product.stock} units available in stock.`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      newCart[existingIndex].quantity = newQty;
    } else {
      if (product.stock > 0 && quantity > product.stock) {
        toast({
          title: "Out of Stock",
          description: `Cannot add. Only ${product.stock} units available.`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      newCart.push({ product, quantity });
    }

    saveCart(newCart);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your shopping cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    const newCart = cart.filter((item) => item.product.id !== productId);
    saveCart(newCart);
    
    if (item) {
      toast({
        title: "Removed from Cart",
        description: `${item.product.name} removed from your cart.`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((i) => i.product.id === productId);
    if (item && item.product.stock > 0 && quantity > item.product.stock) {
      toast({
        title: "Limit Exceeded",
        description: `Only ${item.product.stock} units available in stock.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Wishlist actions
  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    let newWishlist: Product[];

    if (exists) {
      newWishlist = wishlist.filter((item) => item.id !== product.id);
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} removed from your wishlist.`,
      });
    } else {
      newWishlist = [...wishlist, product];
      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to your wishlist.`,
      });
    }
    saveWishlist(newWishlist);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
