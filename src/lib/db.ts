import { Pool, types } from "pg";
import bcrypt from "bcrypt";

// Automatically parse NUMERIC(10,2) fields (OID 1700) as floats
types.setTypeParser(1700, (val) => parseFloat(val));

let pool: Pool | null = null;

export const getDbPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables.");
    }
    pool = new Pool({
      connectionString,
    });
  }
  return pool;
};

export const query = async (text: string, params?: unknown[]) => {
  const p = getDbPool();
  return p.query(text, params);
};

let dbInitialized = false;

export const initDb = async () => {
  if (dbInitialized) return;

  try {
    // 1. Create tables if not exist
    await query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        password_hash TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category TEXT NOT NULL,
        nutrition JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        pincode TEXT NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        amount NUMERIC(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'shipped', 'delivered')),
        payment_id TEXT,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price NUMERIC(10,2) NOT NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(product_id, user_id)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS public.blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);

    // 2. Safely alter tables to support credentials and verification if already created by schema.sql
    await query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;
    `);

    // Remove foreign keys linking to Supabase auth schema if they exist
    try {
      await query(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;`);
    } catch {
      // Ignored if constraint doesn't exist
    }

    // 3. Seed default admin and customer if not present
    const testAdmin = await query("SELECT id FROM public.users WHERE email = $1", ["admin@milky.com"]);
    if (testAdmin.rows.length === 0) {
      const hashedPw = await bcrypt.hash("password", 10);
      await query(
        `INSERT INTO public.users (name, email, phone, role, password_hash, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ["Milky Mushrooms Admin", "admin@milky.com", "+91 86107 55195", "admin", hashedPw, true]
      );
    }

    const testCustomer = await query("SELECT id FROM public.users WHERE email = $1", ["customer@gmail.com"]);
    if (testCustomer.rows.length === 0) {
      const hashedPw = await bcrypt.hash("password", 10);
      await query(
        `INSERT INTO public.users (name, email, phone, role, password_hash, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ["Mohan Kumar", "customer@gmail.com", "+91 99887 76655", "customer", hashedPw, true]
      );
    }

    // 4. Seed products if empty
    const productsCount = await query("SELECT COUNT(*) FROM public.products");
    if (parseInt(productsCount.rows[0].count) === 0) {
      const p1 = {
        name: "Premium Fresh Milky Mushrooms",
        slug: "premium-fresh-milky-mushrooms",
        description: "Freshly harvested organic Milky Mushrooms (Calocybe indica) directly from our farm beds. These mushrooms are known for their firm, meaty texture, milky white appearance, and long shelf life. Perfect for stir-fries, soups, and curries.",
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
        price: 240.0,
        stock: 100,
        category: "Fresh",
        nutrition: JSON.stringify({
          calories: "22 kcal",
          protein: "3.1g",
          carbohydrates: "4.3g",
          fat: "0.2g",
          fiber: "2.5g"
        })
      };

      const p2 = {
        name: "Dehydrated Milky Mushroom Slices",
        slug: "dehydrated-milky-mushroom-slices",
        description: "Premium sundried Milky Mushroom slices with intense earthy aroma. Dehydrated at optimal temperatures to preserve nutrients and prolong shelf-life up to 6 months. Rehydrate in warm water for 15 minutes before cooking.",
        image: "/images/dried_milky_mushrooms.png",
        price: 350.0,
        stock: 50,
        category: "Dried",
        nutrition: JSON.stringify({
          calories: "280 kcal",
          protein: "26.5g",
          carbohydrates: "48.2g",
          fat: "1.8g",
          fiber: "18.4g"
        })
      };

      const p3 = {
        name: "Milky Mushroom Cultivation Spawn",
        slug: "milky-mushroom-spawn",
        description: "High-quality, laboratory-grown, fully colonized grain spawn of Calocybe indica. Cultivated on sorghum grains under strict sterile conditions. Ideal for mushroom growers looking to inoculate straw beds.",
        image: "/images/milky_mushroom_spawn.png",
        price: 120.0,
        stock: 200,
        category: "Spawn",
        nutrition: JSON.stringify({
          usage: "Mushroom cultivation beds"
        })
      };

      const p4 = {
        name: "Organic Milky Mushroom Powder",
        slug: "organic-milky-mushroom-powder",
        description: "100% pure organic Milky Mushroom powder. Ground from dried, selected mushrooms, rich in vitamins and immune-supporting beta-glucans. Add to soups, smoothies, or baking flour for a nutritious boost.",
        image: "/images/milky_mushroom_powder.png",
        price: 450.0,
        stock: 30,
        category: "Powder",
        nutrition: JSON.stringify({
          calories: "310 kcal",
          protein: "28.0g",
          carbohydrates: "51.0g",
          fat: "1.5g",
          fiber: "19.0g"
        })
      };

      for (const p of [p1, p2, p3, p4]) {
        await query(
          `INSERT INTO public.products (name, slug, description, image, price, stock, category, nutrition)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [p.name, p.slug, p.description, p.image, p.price, p.stock, p.category, p.nutrition]
        );
      }
    }

    // 5. Seed blogs if empty
    const blogsCount = await query("SELECT COUNT(*) FROM public.blog_posts");
    if (parseInt(blogsCount.rows[0].count) === 0) {
      const b1 = {
        title: "Spicy Milky Mushroom Fry",
        slug: "spicy-milky-mushroom-fry",
        content: `A quick and delicious South Indian style mushroom stir-fry.

### Ingredients:
- 250g Fresh Milky Mushrooms
- 1 Large Onion (sliced)
- 1 Tomato (chopped)
- 1 tsp Ginger-garlic paste
- 1/2 tsp Turmeric powder
- 1 tsp Chilli powder
- 1/2 tsp Black Pepper powder
- Curry leaves & cooking oil

### Method:
1. **Prepare Mushrooms**: Wash and chop mushrooms into bite-sized cubes.
2. **Sauté Aromatics**: Heat oil in a pan, add curry leaves and onions. Fry until onions are soft and translucent.
3. **Add Masalas**: Add ginger-garlic paste, fry for 1 minute, then add tomato and stir in the spices. Cook until oil separates.
4. **Cook Mushrooms**: Add chopped mushrooms. Do not add water; mushrooms release their own moisture.
5. **Finish**: Sauté on medium-high heat for 8-10 minutes until mushrooms are tender and dry. Sprinkle black pepper, garnish, and serve hot!`,
        image: "/images/spicy_mushroom_fry.png"
      };

      const b2 = {
        title: "Creamy Milky Mushroom Soup",
        slug: "creamy-milky-mushroom-soup",
        content: `A comforting, velvet-smooth soup highlighting the meaty texture of Milky Mushrooms.

### Ingredients:
- 200g Fresh Milky Mushrooms
- 2 tbsp Butter
- 1 small Onion (finely chopped)
- 2 cloves Garlic (minced)
- 2 tbsp All-purpose flour
- 2 cups Vegetable/Chicken broth
- 1/2 cup Fresh Cream
- Salt and Pepper to taste

### Method:
1. **Prep**: Clean and finely chop the mushrooms.
2. **Sauté**: Melt butter in a pot over medium heat, add garlic and onion, and sauté for 2 minutes.
3. **Add Mushrooms**: Add chopped mushrooms and cook for 6 minutes until tender.
4. **Thicken**: Sprinkle flour over mushrooms, stir well for 1 minute.
5. **Simmer**: Slowly pour in broth while whisking to avoid lumps. Bring to a boil, reduce heat, and simmer for 10 minutes.
6. **Finish**: Stir in fresh cream, salt, and pepper. Simmer for 1 minute and serve warm.`,
        image: "/images/creamy_mushroom_soup.png"
      };

      const b3 = {
        title: "Chettinad Milky Mushroom Gravy",
        slug: "chettinad-milky-mushroom-gravy",
        content: `A rich, aromatic Chettinad-style curry made with fresh ground spices.

### Ingredients:
- 250g Milky Mushrooms
- 10 Shallots (chopped)
- 2 Tomatoes (pureed)
- 1 tbsp Chettinad masala powder
- 1/2 cup Coconut milk
- Mustard seeds, fennel seeds, oil

### Method:
1. **Clean & Slice**: Clean and slice the milky mushrooms.
2. **Temper**: Heat oil in a pan, temper with mustard and fennel seeds.
3. **Base Sauté**: Add shallots and sauté until golden brown, then add tomatoes and cook until soft.
4. **Cook**: Add Chettinad masala, salt, and mushrooms. Cover and cook on medium for 6 minutes.
5. **Coconut Addition**: Pour in coconut milk and simmer on low for 3 minutes. Garnish with fresh coriander leaves.`,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600"
      };

      const b4 = {
        title: "Organic Milky Mushroom Biryani",
        slug: "organic-milky-mushroom-biryani",
        content: `A classic, fragrant rice dish loaded with meaty Milky Mushrooms.

### Ingredients:
- 300g Milky Mushrooms (cubed)
- 2 cups Basmati Rice (soaked for 30 minutes)
- 1/4 cup Mint & Coriander leaves
- 1/2 cup Curd
- 2 tsp Biryani Masala
- Saffron milk, Ghee, Spices

### Method:
1. **Base**: Heat ghee in a large pot, fry whole spices (bay leaf, cardamom, cloves).
2. **Gravy**: Sauté onions till brown, add ginger-garlic paste and mint-coriander leaves. Mix in tomatoes, biryani masala, curd, and mushrooms. Cook for 5 minutes.
3. **Rice**: Cook Basmati rice separately until 70% done, then drain.
4. **Dum**: Layer rice over the mushroom masala, drizzle saffron milk and ghee. Cover and cook on low heat for 15 minutes. Serve with cold raita!`,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600"
      };

      for (const b of [b1, b2, b3, b4]) {
        await query(
          `INSERT INTO public.blog_posts (title, slug, content, image)
           VALUES ($1, $2, $3, $4)`,
          [b.title, b.slug, b.content, b.image]
        );
      }
    }

    dbInitialized = true;
    console.log("Database initialized and seeded successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};
