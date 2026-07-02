"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Award,
  Truck,
  Leaf,
  Clock,
  Sparkles,
  HelpCircle,
  PhoneCall,
  ChevronDown,
  Activity,
  MessageCircle,
} from "lucide-react";
import { productService } from "@/services/product.service";
import { Product, Review } from "@/types";
import ProductCard from "@/features/products/components/ProductCard";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodData = await productService.getProducts();
        setFeaturedProducts(prodData.slice(0, 3)); // show top 3 featured products
        
        const revsData = await productService.getTopReviews();
        setReviews(revsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const whyChooseUs = [
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "14-Day Long Shelf Life",
      desc: "Unlike other varieties, Milky Mushrooms can stay fresh in the refrigerator for up to two weeks without losing flavor.",
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Meaty Texture & High Quality",
      desc: "Known for their firm, thick white caps and meaty texture, they absorb flavors beautifully, making them excellent in curries.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-primary" />,
      title: "100% Organic & Chemical-Free",
      desc: "Grown using locally sourced organic straw substrate without any chemical pesticides, artificial fertilizers, or bleach.",
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "Direct From Farm Delivery",
      desc: "Harvested fresh in the morning and delivered directly to your doorstep in Dindigul, Palani, and Kodaikanal.",
    },
  ];

  const healthBenefits = [
    {
      title: "Rich in Plant Protein",
      desc: "Contains 3-4% high-quality protein (dry basis 25-30%) with all essential amino acids, making it a perfect meat substitute.",
      color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150",
    },
    {
      title: "Boosts Immunity (Beta-Glucans)",
      desc: "Packed with active beta-glucans and polysaccharides that strengthen immune cells and help fight off infections.",
      color: "bg-amber-50 dark:bg-amber-950/20 border-amber-150",
    },
    {
      title: "Low Calorie & Heart Healthy",
      desc: "Zero cholesterol, low fat, and low sodium. Rich in potassium and fiber to regulate blood pressure and digestion.",
      color: "bg-sky-50 dark:bg-sky-950/20 border-sky-150",
    },
    {
      title: "Rich in Vitamin D & B-Complex",
      desc: "One of the few organic non-animal sources of Vitamin D, essential for bone health, alongside Riboflavin and Niacin.",
      color: "bg-pink-50 dark:bg-pink-950/20 border-pink-150",
    },
  ];

  const cultivationSteps = [
    {
      num: "01",
      title: "Substrate Straw Sterilization",
      desc: "Paddy straw is soaked and steam-sterilized to destroy pathogens, ensuring a pure medium for organic cultivation.",
    },
    {
      num: "02",
      title: "Spawning & Inoculation",
      desc: "High-quality Milky Mushroom grain spawn is layered with straw in bags and incubated in dark rooms for colonization.",
    },
    {
      num: "03",
      title: "Casing Layer Application",
      desc: "Fully colonized bags are topped with a sterilized, moisture-holding clay soil casing layer to induce fruiting.",
    },
    {
      num: "04",
      title: "Fruiting & Harvesting",
      desc: "Bags are placed in high-humidity cropping rooms. In 10-15 days, beautiful milky white caps are hand-harvested.",
    },
  ];



  const faqs = [
    {
      q: "What is a Milky Mushroom?",
      a: "Milky Mushroom (Calocybe indica) is a premium edible mushroom native to India. It is highly valued for its large size, robust white cap, meaty texture, mild earthy flavor, and remarkable shelf life.",
    },
    {
      q: "How long can they be stored?",
      a: "Fresh Milky Mushrooms are exceptionally durable. They can stay fresh in the refrigerator for up to 10 to 14 days when stored in paper bags or breathable containers, which is much longer than Oyster or Button mushrooms.",
    },
    {
      q: "Are these mushrooms organic?",
      a: "Yes, 100%! We grow them strictly using organic agricultural methods. We use sterilized paddy straw as a substrate and apply zero chemical fertilizers, growth hormones, or chemical washes.",
    },
    {
      q: "Do you deliver to my location?",
      a: "We offer daily delivery to Dindigul, Palani, Oddanchatram, Kodaikanal, and nearby villages. Place your order on our shop, and we will dispatch freshly harvested packs in the morning.",
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-secondary/40 via-background to-secondary/20 pt-10 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black self-start">
              <Sparkles className="w-3.5 h-3.5" />
              100% Organic Direct Farm Produce
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight font-outfit">
              Fresh Milky Mushrooms <br className="hidden md:inline" />
              <span className="text-primary">Direct From Farm</span> <br className="hidden md:inline" />
              To Home
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Experience the premium, meat-like texture and rich protein profiles of freshly harvested organic Milky Mushrooms, delivered straight to your home from our Dindigul beds.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
              <Link
                href="/shop"
                className="px-6 py-3.5 sm:px-8 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/10 flex items-center gap-2 group transition-all"
              >
                Shop Fresh Harvest
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="px-6 py-3.5 sm:px-8 bg-card hover:bg-muted border border-border text-foreground font-bold rounded-xl transition-all"
              >
                Explore Cultivation
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-[240px] sm:h-[320px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-card bg-secondary/30"
          >
            <Image
              src="/images/fresh_milky_mushrooms.webp"
              alt="Fresh organic milky mushrooms on farm"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority
            />
            
            {/* Overlay tag */}
            <div className="absolute bottom-4 right-4 p-3 sm:bottom-6 sm:right-6 sm:p-4 glass rounded-2xl flex items-center gap-2 sm:gap-3 shadow-lg max-w-[200px] sm:max-w-[240px]">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 font-bold">
                ₹
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Starting from</p>
                <p className="font-extrabold text-base text-foreground">₹120.00 per pack</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FARM FRESH BANNER */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="font-black text-2xl md:text-3xl">100%</span>
            <span className="text-xs font-semibold opacity-90">Organic & Chemical Free</span>
          </div>
          <div className="flex flex-col items-center gap-2 border-l border-primary-foreground/25">
            <span className="font-black text-2xl md:text-3xl">Same Day</span>
            <span className="text-xs font-semibold opacity-90">Harvest & Shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2 border-l-0 md:border-l border-primary-foreground/25">
            <span className="font-black text-2xl md:text-3xl">14 Days</span>
            <span className="text-xs font-semibold opacity-90">Extended Fridge Shelf Life</span>
          </div>
          <div className="flex flex-col items-center gap-2 border-l border-primary-foreground/25">
            <span className="font-black text-2xl md:text-3xl">4 Regions</span>
            <span className="text-xs font-semibold opacity-90">Daily Local Express Hubs</span>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-12 md:py-20 container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary">Farm Fresh Shop</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-foreground font-outfit">
              Our Bestselling Harvest
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 group"
          >
            View Entire Shop Catalogue
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-border animate-pulse rounded-2xl h-[380px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-12 md:py-20 bg-secondary/15 dark:bg-muted/10 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Key Advantages</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-1 text-foreground font-outfit">
              Why Buy Milky Mushrooms?
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Milky Mushrooms (Calocybe indica) are uniquely suited to Indian cooking and climates, delivering premium quality unmatched by standard button mushrooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border/40 shadow-sm flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <h3 className="font-bold text-base text-foreground leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTH BENEFITS */}
      <section className="py-12 md:py-20 container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-5">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Nutritional Powerhouse</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-outfit">
              Health Benefits of Milky Mushrooms
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Incorporate our farm-fresh Milky Mushrooms into your weekly meals to experience their dense profiles of protein, minerals, and dietary fibers.
            </p>
            <div className="flex items-center gap-3 p-4 border border-border/80 rounded-2xl bg-card">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">Doctor Approved</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">High fiber and low glycemic index make them ideal for diabetics.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {healthBenefits.map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border border-border/30 flex flex-col gap-3 ${item.color}`}
              >
                <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FARM PROCESS */}
      <section className="py-12 md:py-20 bg-secondary/15 dark:bg-muted/10 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Cultivation Lifecycle</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-1 text-foreground font-outfit">
              Our Eco-Friendly Farm Process
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              We monitor each stage of the lifecycle closely under strict sterile and organic standards to guarantee a premium harvest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {cultivationSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4 bg-card p-6 rounded-2xl border border-border/40 relative shadow-sm">
                <span className="font-black text-3xl text-primary/20 absolute top-4 right-4">{step.num}</span>
                <h3 className="font-bold text-base text-foreground mt-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-12 md:py-20 container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-14">
          <span className="text-xs font-black uppercase tracking-wider text-primary">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-1 text-foreground font-outfit">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.length === 0 ? (
            <div className="md:col-span-3 text-center py-10 bg-card border border-border/40 rounded-2xl">
              <p className="text-xs text-muted-foreground italic">No reviews yet. Be the first to leave one!</p>
            </div>
          ) : (
            reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <span key={i} className="text-amber-500 font-bold text-base">★</span>
                      ))}
                    </div>
                    {rev.product_name && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider max-w-[150px] truncate">
                        {rev.product_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    &ldquo;{rev.comment && rev.comment.length > 120 ? `${rev.comment.substring(0, 120)}...` : rev.comment}&rdquo;
                  </p>
                </div>
                <div className="border-t border-border mt-5 pt-4 flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{rev.user_name}</span>
                  <span className="text-primary font-semibold">{rev.location}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-12 md:py-20 bg-secondary/15 dark:bg-muted/10 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Queries Answered</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-1 text-foreground font-outfit">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm text-foreground hover:bg-muted/20"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    className={`px-5 text-xs text-muted-foreground leading-relaxed transition-all ${
                      isOpen ? "pb-4 h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT CTA SECTION */}
      <section className="py-12 md:py-20 container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="bg-primary rounded-3xl text-primary-foreground p-6 sm:p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-black/10 opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3 max-w-lg">
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 text-primary-foreground/90 px-3 py-1 rounded-full self-start">
              Immediate Support
            </span>
            <h2 className="text-2xl md:text-4xl font-black font-outfit">
              Need fresh mushrooms today?
            </h2>
            <p className="text-xs md:text-sm text-primary-foreground/90 leading-relaxed">
              We coordinate bulk custom requests, retail packs, or crop inquiries directly via WhatsApp. Contact our farm supervisor directly for quick dispatches!
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 w-full md:w-auto">
            <a
              href="tel:+918610755195"
              className="w-full sm:w-auto justify-center px-6 py-3 bg-black/35 hover:bg-black/50 text-white font-bold text-sm rounded-xl flex items-center gap-2 border border-white/10 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Farm
            </a>
            <a
              href="https://wa.me/918610755195?text=I'd%20like%20to%20place%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-6 py-3 bg-white text-primary font-bold text-sm rounded-xl hover:bg-white/90 shadow-lg shadow-black/10 flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-primary" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
      
    </div>
  );
}
