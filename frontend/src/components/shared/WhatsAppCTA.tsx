"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export const WhatsAppCTA: React.FC = () => {
  const phoneNumber = "+918610755195";
  const defaultMessage = "Hello Milky Mushrooms! I would like to order fresh mushrooms from your farm.";
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba5a] transition-colors group"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing Outer Rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
        
        {/* Main WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366] relative z-10" />

        {/* Hover Tooltip */}
        <span className="absolute left-16 scale-0 group-hover:scale-100 origin-left transition-all duration-200 bg-foreground text-background font-semibold text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap z-10">
          Chat on WhatsApp
        </span>
      </motion.a>
    </div>
  );
};
export default WhatsAppCTA;
