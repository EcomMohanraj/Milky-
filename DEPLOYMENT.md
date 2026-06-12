# Production Deployment Guide: Milky Mushrooms

Follow this step-by-step guide to launch your Milky Mushrooms e-commerce site to production on Vercel, backed by a live Supabase PostgreSQL database and Razorpay payments.

---

## Step 1: Provision your Supabase Database
1. Sign up/Log in to [Supabase](https://supabase.com).
2. Click **New Project**, choose a database name (e.g. `Milky Mushrooms`), set a strong password, and select a hosting region closest to your delivery hubs (e.g. `Mumbai / South Asia`).
3. Once the database provision completes, navigate to **SQL Editor** in the left sidebar.
4. Click **New Query**, paste the contents of `schema.sql`, and click **Run**. This will create all PostgreSQL tables, enable Row Level Security (RLS) policies, configure automatic user profile triggers, and seed the initial product catalog.

---

## Step 2: Configure Supabase Authentication
1. Go to **Authentication -> Providers** in Supabase.
2. Ensure **Email Provider** is enabled.
3. Turn on/off **Confirm Email** depending on whether you want users to verify their emails before logging in.
4. Go to **Authentication -> URL Configuration** and set:
   - **Site URL**: `https://your-domain.vercel.app` (replace with your Vercel deployment URL)
   - **Redirect URLs**: Add `https://your-domain.vercel.app/dashboard`

---

## Step 3: Setup Razorpay Payments (Test / Live Mode)
1. Register/Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings -> API Keys** from the bottom-left menu.
3. Select **Test Mode** (for developer testing) or **Live Mode** (for processing real payments).
4. Click **Generate Key**.
5. Copy down the:
   - **Key ID** (will be exposed on the frontend client)
   - **Key Secret** (must remain secure on the backend server)

---

## Step 4: Deploy Next.js to Vercel
1. Initialize a Git repository in your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Milky Mushrooms"
   ```
2. Create a new repository on GitHub and push your local commits.
3. Log in to [Vercel](https://vercel.com) and click **Add New -> Project**.
4. Import your GitHub repository.
5. In **Environment Variables**, add the following keys from your Supabase and Razorpay credentials:

| Environment Variable | Source / Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase -> Project Settings -> API -> Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase -> Project Settings -> API -> anon public key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard -> API Keys -> Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard -> API Keys -> Key Secret |
| `NEXT_PUBLIC_APP_URL` | Your live deployment URL (e.g. `https://milkymushrooms.com`) |
| `MOCK_PAYMENT` | Set to `false` in production (enables real Razorpay transactions) |

6. Click **Deploy**. Vercel will compile the Next.js App Router, optimize Tailwind CSS v4, bundle components, and publish your site.

---

## Step 5: Verification & Launch
1. Visit your Vercel deployment link in a browser.
2. Sign up with a test email. It should create a corresponding record in the Supabase `users` table.
3. Add a pack of **Premium Fresh Milky Mushrooms** to your cart and hit **Checkout**.
4. If `MOCK_PAYMENT` is set to `false`, it will invoke the official Razorpay Checkout modal, allowing cards, UPI, and net-banking transactions.
