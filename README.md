# Milky Mushrooms E-commerce Platform

A production-ready, mobile-first e-commerce web application for **Milky Mushrooms**, selling organic mushrooms direct from our farm in Dindigul, Tamil Nadu to homes in neighboring districts.

## Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4, CSS-first design tokens, HSL colors (Green, Cream, Brown palette)
- **Language**: TypeScript (Type-safe schemas, props, and states)
- **Animations**: Framer Motion (Page transitions, slide-over drawer drawers, modal animations)
- **Database & Auth**: Supabase (PostgreSQL tables, Row Level Security, automatic trigger handlers)
- **Payments**: Razorpay Payment Gateway integration (supporting live checkouts & offline mock gates)
- **State Management**: TanStack React Query (server-side caching) + Client Cart Context
- **Forms**: React Hook Form + Zod validation schemas

---

## Folder Structure
```
milky-mushrooms/
├── public/                  # Static assets & icons
│   ├── favicon.ico
│   └── manifest.webmanifest # PWA specifications
├── src/
│   ├── app/                 # Next.js App Router Pages & API
│   │   ├── admin/           # Administrative Analytics, Products CRUD & Orders
│   │   ├── api/             # API Router for payment signature checks
│   │   ├── about/           # Story, Timeline, Team & Certifications
│   │   ├── contact/         # Contact forms & delivery eligibility checkers
│   │   ├── dashboard/       # User Profile, address book, orders history & Checkout
│   │   ├── recipes/         # Cooking guides & recipe modal reader
│   │   ├── shop/            # Searchable product grid, slugs & detail pages
│   │   ├── globals.css      # Tailwind v4, scrollbars, HSL root classes
│   │   └── layout.tsx       # Fonts (Outfit/Inter), SEO metadata, Layout wrapper
│   ├── components/          # Reusable UI widgets
│   │   ├── layout/          # Sticky Navbar Header, Footers & Shell wrappers
│   │   ├── shop/            # Cart drawers, Product cards, Quick-view overlays
│   │   └── ui/              # Floating WhatsApp buttons & Toast contexts
│   ├── lib/                 # Core utilities
│   │   ├── auth-context.tsx # Auth listener, Supabase profiles & mock users
│   │   ├── cart-context.tsx # Add/Remove items, totals, wishlist togglers
│   │   ├── providers.tsx    # Combined context provider wrapper
│   │   └── supabase.ts      # Unified DB query controller with local fallback
│   └── types/               # TypeScript interfaces
├── .env.example             # Configuration variables blueprint
├── package.json             # NPM dependencies & build scripts
├── schema.sql               # PostgreSQL tables, policies & seeds
└── tsconfig.json            # TypeScript settings
```

---

## Visual Design & HSL Colors
We utilize a clean **Green + Cream + Brown** color palette representing growth and soil:
- **Primary Farm Green**: `hsl(142 72% 29%)`
- **Secondary Cream**: `hsl(43 60% 90%)`
- **Text Soil Brown**: `hsl(25 40% 12%)`
- **Background Cream**: `hsl(43 89% 97%)`
- Includes native dark-mode class overrides (`.dark`) mapping deep soil brown backgrounds.

---

## Local Development & Sandbox Evaluation
You can run and test this application locally **out-of-the-box** without immediate credentials:
1. **Clone & Set Workspace**: Open this directory in your editor.
2. **Install Packages**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

### Sandbox Testing Credentials
The authentication and database clients automatically fallback to a robust `localStorage` client pre-seeded with mushrooms, recipes, and orders when env keys are missing. You can sign in using:
- **Customer Account**: `customer@gmail.com` (password: any)
- **Admin Panel Account**: `admin@milky.com` (password: any)

---

## Production Supabase Setup
To move from local mock evaluation to a live production database:
1. Create a project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the queries defined in `schema.sql` to setup tables, RLS policies, trigger profiles, and seed data.
3. Obtain API credentials and populate your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy the Next.js app on Vercel.
