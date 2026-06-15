"use client";

import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import CartDrawer from "@/features/cart/components/CartDrawer";
import { useRouter } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();

  const handleCheckoutClick = () => {
    // Redirect to User Dashboard which houses profile / address management
    // or direct checkout page. We will route to dashboard for checkout!
    router.push("/dashboard?checkout=true");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Header */}
      <Header onCartToggle={() => setCartOpen(true)} />
      
      {/* Page Content */}
      <main className="flex-grow flex flex-col">{children}</main>
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Sticky Icon */}
      <WhatsAppCTA />
      
      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckoutClick={handleCheckoutClick}
      />
    </div>
  );
};
export default LayoutWrapper;
