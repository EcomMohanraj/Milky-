-- Milky Mushrooms E-commerce Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Customer/Admin Profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only of users" ON public.users 
  FOR SELECT USING (true);

CREATE POLICY "Allow individual user to update their own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow individual user to insert their own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL, -- URL or Supabase storage path
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category TEXT NOT NULL, -- e.g., "Fresh", "Dried", "Spawn", "Powder"
  nutrition JSONB DEFAULT '{}'::jsonb, -- e.g., {"protein": "3.1g", "calories": "22 kcal"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only of products" ON public.products 
  FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage products" ON public.products 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- 3. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own addresses" ON public.addresses 
  FOR ALL USING (auth.uid() = user_id);


-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'shipped', 'delivered')),
  payment_id TEXT, -- Razorpay Payment/Order ID
  address TEXT, -- Flattened address snapshot at time of purchase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own orders" ON public.orders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to place orders" ON public.orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all orders" ON public.orders 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL
);

-- Enable RLS for order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to insert their own order items" ON public.order_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to view all order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, user_id)
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only of reviews" ON public.reviews 
  FOR SELECT USING (true);

CREATE POLICY "Allow users to manage their own reviews" ON public.reviews 
  FOR ALL USING (auth.uid() = user_id);


-- 7. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for blogs
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only of blog posts" ON public.blog_posts 
  FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage blog posts" ON public.blog_posts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- Automatic user profile creation on Supabase signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Valued Customer'),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- SEED DATA FOR PRODUCTS
INSERT INTO public.products (name, slug, description, image, price, stock, category, nutrition)
VALUES
(
  'Premium Fresh Milky Mushrooms',
  'premium-fresh-milky-mushrooms',
  'Freshly harvested organic Milky Mushrooms (Calocybe indica) directly from our farm beds. These mushrooms are known for their firm, meaty texture, milky white appearance, and long shelf life. Perfect for stir-fries, soups, and curries.',
  'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600',
  240.00,
  100,
  'Fresh',
  '{"calories": "22 kcal", "protein": "3.1g", "carbohydrates": "4.3g", "fat": "0.2g", "fiber": "2.5g"}'::jsonb
),
(
  'Dehydrated Milky Mushroom Slices',
  'dehydrated-milky-mushroom-slices',
  'Premium sundried Milky Mushroom slices with intense earthy aroma. Dehydrated at optimal temperatures to preserve nutrients and prolong shelf-life up to 6 months. Rehydrate in warm water for 15 minutes before cooking.',
  '/images/dried_milky_mushrooms.png',
  350.00,
  50,
  'Dried',
  '{"calories": "280 kcal", "protein": "26.5g", "carbohydrates": "48.2g", "fat": "1.8g", "fiber": "18.4g"}'::jsonb
),
(
  'Milky Mushroom Cultivation Spawn',
  'milky-mushroom-spawn',
  'High-quality, laboratory-grown, fully colonized grain spawn of Calocybe indica. Cultivated on sorghum grains under strict sterile conditions. Ideal for mushroom growers looking to inoculate straw beds.',
  '/images/milky_mushroom_spawn.png',
  120.00,
  200,
  'Spawn',
  '{"usage": "Mushroom cultivation beds"}'::jsonb
),
(
  'Organic Milky Mushroom Powder',
  'organic-milky-mushroom-powder',
  '100% pure organic Milky Mushroom powder. Ground from dried, selected mushrooms, rich in vitamins and immune-supporting beta-glucans. Add to soups, smoothies, or baking flour for a nutritious boost.',
  '/images/milky_mushroom_powder.png',
  450.00,
  30,
  'Powder',
  '{"calories": "310 kcal", "protein": "28.0g", "carbohydrates": "51.0g", "fat": "1.5g", "fiber": "19.0g"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  category = EXCLUDED.category,
  nutrition = EXCLUDED.nutrition;


-- SEED DATA FOR BLOG POSTS (RECIPES)
INSERT INTO public.blog_posts (title, slug, content, image)
VALUES
(
  'Spicy Milky Mushroom Fry',
  'spicy-milky-mushroom-fry',
  'A quick and delicious South Indian style mushroom stir-fry. Ingredients:\n- 250g Fresh Milky Mushrooms\n- 1 Large Onion (sliced)\n- 1 Tomato (chopped)\n- 1 tsp Ginger-garlic paste\n- 1/2 tsp Turmeric powder\n- 1 tsp Chilli powder\n- 1/2 tsp Black Pepper powder\n- Curry leaves & oil\n\nMethod:\n1. Wash and chop mushrooms into bite-sized cubes.\n2. Heat oil in a pan, add curry leaves and onions, fry until translucent.\n3. Add ginger-garlic paste, fry for 1 min, then add tomato.\n4. Stir in spices and cook till oil separates.\n5. Add mushrooms, do not add water (mushrooms release their own water).\n6. Sauté on medium-high heat for 8-10 minutes until mushrooms are cooked and dry. Sprinkle black pepper and serve hot!',
  '/images/spicy_mushroom_fry.png'
),
(
  'Creamy Milky Mushroom Soup',
  'creamy-milky-mushroom-soup',
  'A comforting, velvet-smooth soup highlighting the meaty Milky Mushrooms. Ingredients:\n- 200g Fresh Milky Mushrooms\n- 2 tbsp Butter\n- 1 small Onion (finely chopped)\n- 2 cloves Garlic (minced)\n- 2 tbsp All-purpose flour\n- 2 cups Vegetable/Chicken broth\n- 1/2 cup Fresh Cream\n- Salt and Pepper to taste\n\nMethod:\n1. Chop mushrooms finely.\n2. Melt butter in a pot over medium heat, add garlic and onion, sauté for 2 minutes.\n3. Add chopped mushrooms and cook for 6 minutes until tender.\n4. Sprinkle flour over mushrooms, stir well for 1 minute.\n5. Slowly pour in broth while whisking to avoid lumps.\n6. Bring to a boil, reduce heat, simmer for 10 minutes.\n7. Stir in fresh cream, salt, and pepper. Simmer for 1 minute and serve warm garnished with chives.',
  '/images/creamy_mushroom_soup.png'
),
(
  'Chettinad Milky Mushroom Gravy',
  'chettinad-milky-mushroom-gravy',
  'A rich, aromatic Chettinad-style curry made with fresh ground spices. Ingredients:\n- 250g Milky Mushrooms\n- 10 Shallots (chopped)\n- 2 Tomatoes (pureed)\n- 1 tbsp Chettinad masala powder\n- 1/2 cup Coconut milk\n- Mustard seeds, fennel seeds, oil\n\nMethod:\n1. Clean and slice mushrooms.\n2. Heat oil in a pan, temper with mustard and fennel seeds.\n3. Add shallots and sauté until golden brown.\n4. Add tomatoes and cook until soft.\n5. Add Chettinad masala, salt, and mushrooms. Cover and cook on medium for 6 minutes.\n6. Pour in coconut milk and simmer on low for 3 minutes. Garnish with fresh coriander leaves.',
  'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600'
),
(
  'Organic Milky Mushroom Biryani',
  'organic-milky-mushroom-biryani',
  'A classic, fragrant biryani loaded with meaty Milky Mushrooms. Ingredients:\n- 300g Milky Mushrooms (cubed)\n- 2 cups Basmati Rice (soaked)\n- 1/4 cup Mint & Coriander leaves\n- 1/2 cup Curd\n- 2 tsp Biryani Masala\n- Saffron milk, Ghee, Spices\n\nMethod:\n1. Clean and chop mushrooms.\n2. Heat ghee, fry whole spices (bay leaf, cardamom, cloves).\n3. Sauté onions till brown, add ginger-garlic paste and mint-coriander leaves.\n4. Mix in tomatoes, biryani masala, curd, and mushrooms. Cook for 5 minutes.\n5. In a separate pot, cook Basmati rice till 70% done.\n6. Layer rice over the mushroom masala, drizzle saffron milk and ghee.\n7. Close lid, seal edges, and cook on low heat (dum) for 15 minutes. Serve with raita!',
  'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  image = EXCLUDED.image;
