"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Phone, Mail, MapPin, Send, HelpCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast-simple";

// Zod contact validation schema
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Delivery checker states
  const [checkLocation, setCheckLocation] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<"eligible" | "ineligible" | null>(null);

  const eligibleHubs = ["dindigul", "palani", "oddanchatram", "kodaikanal", "nilakottai", "vedasandur", "natham"];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = () => {
    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setSubmitting(false);
      reset();
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out! Our farm team will contact you shortly.",
        variant: "success",
      });
    }, 1500);
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const query = checkLocation.trim().toLowerCase();
    
    if (query === "") {
      setDeliveryStatus(null);
      return;
    }

    const isMatch = eligibleHubs.some(
      (hub) => query.includes(hub) || hub.includes(query)
    );

    if (isMatch) {
      setDeliveryStatus("eligible");
    } else {
      setDeliveryStatus("ineligible");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col gap-16 pb-20">
      
      {/* Intro */}
      <section className="text-center max-w-2xl mx-auto flex flex-col gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary justify-center">
          <HelpCircle className="w-3.5 h-3.5" />
          Get In Touch
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-outfit">
          Contact Our Farm Team
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
          Have questions about bulk orders, spawn availability, or delivery locations? Drop us a line or verify your pincode below.
        </p>
      </section>

      {/* Main Grid: Form and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-card border border-border/60 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-5">
          <h2 className="text-xl font-extrabold text-foreground font-outfit">Send a Message</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                type="text"
                placeholder="Your name"
                {...register("name")}
                className={`border p-2.5 rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.name ? "border-red-500" : "border-border"
                }`}
              />
              {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                placeholder="Your email address"
                {...register("email")}
                className={`border p-2.5 rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.email ? "border-red-500" : "border-border"
                }`}
              />
              {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
              <input
                type="text"
                placeholder="10-digit mobile number"
                {...register("phone")}
                className={`border p-2.5 rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.phone ? "border-red-500" : "border-border"
                }`}
              />
              {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</label>
              <textarea
                rows={4}
                placeholder="Details of your inquiry..."
                {...register("message")}
                className={`border p-2.5 rounded-lg text-xs text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.message ? "border-red-500" : "border-border"
                }`}
              />
              {errors.message && <span className="text-[10px] text-red-500">{errors.message.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 shadow-md shadow-primary/10 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Sending message..." : "Submit Inquiry"}
            </button>
          </form>
        </div>

        {/* Contact Details and Checker */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Info */}
          <div className="bg-card border border-border/60 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
            <h2 className="text-lg font-extrabold text-foreground font-outfit">Farm Coordinates</h2>
            
            <ul className="flex flex-col gap-4 text-xs">
              <li className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">
                  Milky Mushrooms Cultivation Bed,<br />
                  Oddanchatram Main Highway, Dindigul,<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                <a href="tel:+918610755195" className="text-muted-foreground hover:text-primary transition-colors">
                  +91 86107 55195
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                <a href="mailto:fresh@milkymushrooms.com" className="text-muted-foreground hover:text-primary transition-colors">
                  fresh@milkymushrooms.com
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery Checker */}
          <div className="bg-card border border-border/60 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-foreground font-outfit">Delivery Zone Checker</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Type your city or village name in Dindigul region to see if you qualify for daily morning dispatches.
            </p>

            <form onSubmit={handleCheckDelivery} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter city (e.g. Palani)..."
                value={checkLocation}
                onChange={(e) => setCheckLocation(e.target.value)}
                className="flex-1 border border-border p-2 rounded-lg text-xs text-foreground bg-background focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 bg-secondary text-secondary-foreground font-bold text-xs rounded-lg hover:bg-secondary/80"
              >
                Check
              </button>
            </form>

            {deliveryStatus === "eligible" && (
              <div className="flex gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-900 dark:text-emerald-100 text-xs">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Delivery Eligible!</p>
                  <p className="opacity-90 scale-95 origin-left mt-0.5">We offer morning fresh dispatches in this area.</p>
                </div>
              </div>
            )}

            {deliveryStatus === "ineligible" && (
              <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-900 dark:text-red-100 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold">Not Directly Serviced</p>
                  <p className="opacity-90 scale-95 origin-left mt-0.5">We deliver nearby. Chat with us on WhatsApp to arrange transport.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Styled Mock Google Map */}
      <section className="flex flex-col gap-4 w-full">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">Our Location</h3>
        <div className="w-full h-[320px] rounded-3xl border border-border/80 overflow-hidden relative bg-muted/40 shadow-inner flex items-center justify-center text-center p-6">
          {/* Stylized visual mock map */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="flex flex-col items-center gap-3 relative z-10 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center shadow">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-foreground">Milky Mushrooms Farm, Dindigul</h4>
            <p className="text-xs text-muted-foreground leading-normal">
              Located on the Oddanchatram highway bypass. Visitors are welcome for crop training and direct bed purchasing after booking!
            </p>
            <a
              href="https://maps.google.com/?q=10.3673,77.9803"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
