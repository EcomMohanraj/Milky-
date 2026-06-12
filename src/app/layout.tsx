import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/contexts/Providers";
import LayoutWrapper from "@/components/layouts/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://milky-psi.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: "Milky Mushrooms | Fresh Milky Mushrooms Direct From Farm To Home",
  description:
    "Order premium organic fresh Milky Mushrooms (Calocybe indica) directly from our farm in Dindigul, Tamil Nadu. High in protein, low in fat, chemical-free.",
  keywords: [
    "milky mushrooms",
    "calocybe indica",
    "fresh mushrooms",
    "organic farm",
    "dindigul mushrooms",
    "mushroom delivery",
    "buy mushrooms online",
  ],
  authors: [{ name: "Milky Mushrooms Farm" }],
  openGraph: {
    title: "Milky Mushrooms | Organic Mushrooms Direct From Farm",
    description: "Premium fresh Milky Mushrooms harvested daily and delivered directly to your home.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://milky-psi.vercel.app",
    siteName: "Milky Mushrooms",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
