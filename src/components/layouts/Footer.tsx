"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, CheckCircle, ShieldCheck, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const deliveryLocations = ["Dindigul", "Palani", "Oddanchatram", "Kodaikanal", "Nearby Villages"];

  return (
    <footer className="bg-secondary/30 dark:bg-black/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand and Description */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
                M
              </div>
              <span className="font-bold text-lg tracking-tight text-primary">
                Milky<span className="text-foreground font-medium">Mushrooms</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sell only fresh Milky Mushrooms (Calocybe indica) grown directly on our organic farm under sterile, controlled conditions. Delivered fresh from our beds to your home.
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                100% Organic & Chemical-Free
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold">FSSAI Certified Cultivation</span>
                </div>
                <span className="text-[10px] text-muted-foreground pl-6">Lic. No. 22426292000031</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home Page</Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">Our Shop</Link>
              </li>
              <li>
                <Link href="/recipes" className="text-muted-foreground hover:text-primary transition-colors">Mushroom Recipes</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Our Farm</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground">Get in Touch</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-2.5 items-start text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>
                  Milky Mushrooms Farm,<br />
                  Oddanchatram Road, Dindigul,<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex gap-2.5 items-center text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+918610755195" className="hover:text-primary transition-colors">+91 86107 55195</a>
              </li>
              <li className="flex gap-2.5 items-center text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:orders@milkymushroom.in" className="hover:text-primary transition-colors">orders@milkymushroom.in</a>
              </li>
            </ul>
          </div>

          {/* Delivery Locations */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-foreground">Delivery Locations</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              We deliver fresh harvests daily to the following areas and their neighboring villages:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {deliveryLocations.map((loc) => (
                <span
                  key={loc}
                  className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90 rounded-full"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/60 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Milky Mushrooms. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Grown with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> directly in Dindigul, Tamil Nadu.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
