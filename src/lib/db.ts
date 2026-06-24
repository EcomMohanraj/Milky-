import { Pool, types } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

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
      max: 4, // Limit pool connections in serverless containers
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Prevent unhandled pg errors from crashing the Node/Next.js serverless process
    pool.on("error", (err) => {
      console.error("Unexpected error on idle database client:", err);
    });
  }
  return pool;
};

// Local type definitions to satisfy ESLint
interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  password_hash: string;
  is_verified: boolean;
  verification_token: string | null;
  created_at: string;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  nutrition: Record<string, string>;
  created_at: string;
}

interface MockBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  created_at: string;
}

interface MockAddress {
  id: string;
  user_id: string;
  address: string;
  city: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

interface MockOrder {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_id: string | null;
  address: string;
  created_at: string;
}

interface MockOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface MockReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface MockDb {
  users: MockUser[];
  products: MockProduct[];
  blog_posts: MockBlogPost[];
  addresses: MockAddress[];
  orders: MockOrder[];
  order_items: MockOrderItem[];
  reviews: MockReview[];
}

// Mock Database state management
const getMockDbPath = () => {
  return path.join(os.tmpdir(), "milky_mock_db.json");
};

const loadMockDb = (): MockDb => {
  const dbPath = getMockDbPath();
  if (fs.existsSync(dbPath)) {
    try {
      return JSON.parse(fs.readFileSync(dbPath, "utf-8")) as MockDb;
    } catch (e) {
      console.error("Error reading mock DB file:", e);
    }
  }

  // Initialize with seed data
  const hashedPw = bcrypt.hashSync("password", 10);
  const data: MockDb = {
    users: [],
    products: [
      {
        id: "33333333-3333-3333-3333-333333333331",
        name: "Premium Fresh Milky Mushrooms",
        slug: "premium-fresh-milky-mushrooms",
        description: "Freshly harvested organic Milky Mushrooms (Calocybe indica) directly from our farm beds. These mushrooms are known for their firm, meaty texture, milky white appearance, and long shelf life. Perfect for stir-fries, soups, and curries.",
        image: "/images/fresh_milky_mushrooms.png",
        price: 240.0,
        stock: 100,
        category: "Fresh",
        nutrition: {
          calories: "22 kcal",
          protein: "3.1g",
          carbohydrates: "4.3g",
          fat: "0.2g",
          fiber: "2.5g"
        },
        created_at: new Date().toISOString()
      },
      {
        id: "33333333-3333-3333-3333-333333333332",
        name: "Dehydrated Milky Mushroom Slices",
        slug: "dehydrated-milky-mushroom-slices",
        description: "Premium sundried Milky Mushroom slices with intense earthy aroma. Dehydrated at optimal temperatures to preserve nutrients and prolong shelf-life up to 6 months. Rehydrate in warm water for 15 minutes before cooking.",
        image: "/images/dried_milky_mushrooms.png",
        price: 350.0,
        stock: 50,
        category: "Dried",
        nutrition: {
          calories: "280 kcal",
          protein: "26.5g",
          carbohydrates: "48.2g",
          fat: "1.8g",
          fiber: "18.4g"
        },
        created_at: new Date().toISOString()
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Milky Mushroom Cultivation Spawn",
        slug: "milky-mushroom-spawn",
        description: "High-quality, laboratory-grown, fully colonized grain spawn of Calocybe indica. Cultivated on sorghum grains under strict sterile conditions. Ideal for mushroom growers looking to inoculate straw beds.",
        image: "/images/milky_mushroom_spawn.png",
        price: 120.0,
        stock: 200,
        category: "Spawn",
        nutrition: {
          usage: "Mushroom cultivation beds"
        },
        created_at: new Date().toISOString()
      },
      {
        id: "33333333-3333-3333-3333-333333333334",
        name: "Organic Milky Mushroom Powder",
        slug: "organic-milky-mushroom-powder",
        description: "100% pure organic Milky Mushroom powder. Ground from dried, selected mushrooms, rich in vitamins and immune-supporting beta-glucans. Add to soups, smoothies, or baking flour for a nutritious boost.",
        image: "/images/milky_mushroom_powder.png",
        price: 450.0,
        stock: 30,
        category: "Powder",
        nutrition: {
          calories: "310 kcal",
          protein: "28.0g",
          carbohydrates: "51.0g",
          fat: "1.5g",
          fiber: "19.0g"
        },
        created_at: new Date().toISOString()
      }
    ],
    blog_posts: [
      {
        id: "44444444-4444-4444-4444-444444444441",
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
        image: "/images/spicy_mushroom_fry.png",
        created_at: new Date().toISOString()
      },
      {
        id: "44444444-4444-4444-4444-444444444442",
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
        image: "/images/creamy_mushroom_soup.png",
        created_at: new Date().toISOString()
      },
      {
        id: "44444444-4444-4444-4444-444444444443",
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
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600",
        created_at: new Date().toISOString()
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
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
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600",
        created_at: new Date().toISOString()
      }
    ],
    addresses: [] as MockAddress[],
    orders: [] as MockOrder[],
    order_items: [] as MockOrderItem[],
    reviews: [] as MockReview[]
  };
  saveMockDb(data);
  return data;
};

const saveMockDb = (data: MockDb) => {
  try {
    fs.writeFileSync(getMockDbPath(), JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing mock DB file:", e);
  }
};

const initMockDbFile = () => {
  loadMockDb();
};

export const mockQuery = async (text: string, params: unknown[] = []) => {
  const normalized = text.trim().replace(/\s+/g, " ");
  
  // Read current db data from JSON file
  const dbData = loadMockDb();

  // Helper to save db data
  const save = () => saveMockDb(dbData);

  // 1. SELECT COUNT(*) FROM public.products
  if (normalized.includes("SELECT COUNT(*)") && normalized.includes("public.products")) {
    return { rows: [{ count: dbData.products.length.toString() }] };
  }

  // 2. SELECT COUNT(*) FROM public.blog_posts
  if (normalized.includes("SELECT COUNT(*)") && normalized.includes("public.blog_posts")) {
    return { rows: [{ count: dbData.blog_posts.length.toString() }] };
  }

  // 3. SELECT * FROM public.products ORDER BY created_at DESC
  if (normalized.includes("SELECT * FROM public.products") && normalized.includes("ORDER BY created_at DESC")) {
    const sorted = [...dbData.products].sort((a: MockProduct, b: MockProduct) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { rows: sorted };
  }

  // 4. SELECT * FROM public.products WHERE id = $1 or slug = $1
  if (normalized.includes("SELECT * FROM public.products WHERE id = $1") || 
      normalized.includes("SELECT * FROM public.products WHERE slug = $1")) {
    const val = params[0] as string;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const product = dbData.products.find((p: MockProduct) => isUuid ? p.id === val : p.slug === val);
    return { rows: product ? [product] : [] };
  }

  // 5. SELECT * FROM public.users WHERE email = $1
  if (normalized.includes("SELECT * FROM public.users WHERE email = $1")) {
    const email = (params[0] as string).toLowerCase();
    const user = dbData.users.find((u: MockUser) => u.email === email);
    return { rows: user ? [user] : [] };
  }

  // 6. SELECT id FROM public.users WHERE email = $1
  if (normalized.includes("SELECT id FROM public.users WHERE email = $1")) {
    const email = (params[0] as string).toLowerCase();
    const user = dbData.users.find((u: MockUser) => u.email === email);
    return { rows: user ? [{ id: user.id }] : [] };
  }

  // 7. SELECT id, name, email, phone, role, created_at FROM public.users WHERE id = $1
  if (normalized.includes("SELECT id, name, email, phone, role, created_at FROM public.users WHERE id = $1")) {
    const id = params[0] as string;
    const user = dbData.users.find((u: MockUser) => u.id === id);
    if (user) {
      const { id: uid, name, email, phone, role, created_at } = user;
      return { rows: [{ id: uid, name, email, phone, role, created_at }] };
    }
    return { rows: [] };
  }

  // 8. SELECT r.*, u.name as user_name FROM public.reviews r JOIN public.users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC
  if (normalized.includes("FROM public.reviews r") && normalized.includes("JOIN public.users u")) {
    const productId = params[0] as string;
    const matchedReviews = dbData.reviews
      .filter((r: MockReview) => r.product_id === productId)
      .map((r: MockReview) => {
        const user = dbData.users.find((u: MockUser) => u.id === r.user_id);
        return {
          id: r.id,
          product_id: r.product_id,
          user_id: r.user_id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          user_name: user ? user.name : "Unknown User"
        };
      })
      .sort((a: { created_at: string }, b: { created_at: string }) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return { rows: matchedReviews };
  }

  // 9. SELECT * FROM public.blog_posts ORDER BY created_at DESC
  if (normalized.includes("SELECT * FROM public.blog_posts") && normalized.includes("ORDER BY created_at DESC")) {
    const sorted = [...dbData.blog_posts].sort((a: MockBlogPost, b: MockBlogPost) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { rows: sorted };
  }

  // 10. SELECT * FROM public.blog_posts WHERE id = $1 or slug = $1
  if (normalized.includes("SELECT * FROM public.blog_posts WHERE id = $1") || 
      normalized.includes("SELECT * FROM public.blog_posts WHERE slug = $1")) {
    const val = params[0] as string;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const post = dbData.blog_posts.find((b: MockBlogPost) => isUuid ? b.id === val : b.slug === val);
    return { rows: post ? [post] : [] };
  }

  // 11. SELECT o.*, ... FROM public.orders o (GET ALL or BY user_id)
  if (normalized.includes("FROM public.orders o") && normalized.includes("LEFT JOIN public.order_items oi")) {
    const isFiltered = normalized.includes("WHERE o.user_id = $1");
    const userId = isFiltered ? (params[0] as string) : null;

    let ordersList = [...dbData.orders];
    if (isFiltered) {
      ordersList = ordersList.filter((o: MockOrder) => o.user_id === userId);
    }

    const populated = ordersList.map((o: MockOrder) => {
      const items = dbData.order_items
        .filter((oi: MockOrderItem) => oi.order_id === o.id)
        .map((oi: MockOrderItem) => {
          const product = dbData.products.find((p: MockProduct) => p.id === oi.product_id) || {
            id: "",
            name: "",
            price: 0,
            image: ""
          };
          return {
            id: oi.id,
            product_id: oi.product_id,
            quantity: oi.quantity,
            price: oi.price,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image
            }
          };
        });
      return {
        id: o.id,
        user_id: o.user_id,
        amount: o.amount,
        status: o.status,
        payment_id: o.payment_id,
        address: o.address,
        created_at: o.created_at,
        items
      };
    }).sort((a: { created_at: string }, b: { created_at: string }) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return { rows: populated };
  }

  // 12. SELECT * FROM public.addresses WHERE user_id = $1 ORDER BY created_at DESC
  if (normalized.includes("SELECT * FROM public.addresses WHERE user_id = $1")) {
    const userId = params[0] as string;
    const addresses = dbData.addresses
      .filter((addr: MockAddress) => addr.user_id === userId)
      .sort((a: MockAddress, b: MockAddress) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return { rows: addresses };
  }

  // 13. SELECT id FROM public.users WHERE verification_token = $1
  if (normalized.includes("SELECT id FROM public.users WHERE verification_token = $1")) {
    const token = params[0] as string;
    const user = dbData.users.find((u: MockUser) => u.verification_token === token);
    return { rows: user ? [{ id: user.id }] : [] };
  }

  // 14. INSERT INTO public.users
  if (normalized.includes("INSERT INTO public.users")) {
    const [name, email, phone, role, password_hash, is_verified, verification_token] = params;
    const newUser: MockUser = {
      id: crypto.randomUUID(),
      name: name as string,
      email: (email as string).toLowerCase(),
      phone: (phone as string) || null,
      role: (role as string) || "customer",
      password_hash: password_hash as string,
      is_verified: !!is_verified,
      verification_token: (verification_token as string) || null,
      created_at: new Date().toISOString()
    };
    dbData.users.push(newUser);
    save();
    return { rows: [newUser] };
  }

  // 15. INSERT INTO public.products
  if (normalized.includes("INSERT INTO public.products")) {
    const [name, slug, description, image, price, stock, category, nutritionStr] = params;
    const newProduct: MockProduct = {
      id: crypto.randomUUID(),
      name: name as string,
      slug: slug as string,
      description: description as string,
      image: image as string,
      price: parseFloat(price as string),
      stock: parseInt(stock as string) || 0,
      category: category as string,
      nutrition: typeof nutritionStr === "string" ? JSON.parse(nutritionStr) : ((nutritionStr as Record<string, string>) || {}),
      created_at: new Date().toISOString()
    };
    dbData.products.push(newProduct);
    save();
    return { rows: [newProduct] };
  }

  // 16. INSERT INTO public.addresses
  if (normalized.includes("INSERT INTO public.addresses")) {
    const [user_id, address, city, pincode, is_default] = params;
    const newAddress: MockAddress = {
      id: crypto.randomUUID(),
      user_id: user_id as string,
      address: address as string,
      city: city as string,
      pincode: pincode as string,
      is_default: !!is_default,
      created_at: new Date().toISOString()
    };
    dbData.addresses.push(newAddress);
    save();
    return { rows: [newAddress] };
  }

  // 17. INSERT INTO public.orders
  if (normalized.includes("INSERT INTO public.orders")) {
    const [user_id, amount, status, payment_id, address] = params;
    const newOrder: MockOrder = {
      id: crypto.randomUUID(),
      user_id: user_id as string,
      amount: parseFloat(amount as string),
      status: (status as string) || "pending",
      payment_id: (payment_id as string) || null,
      address: address as string,
      created_at: new Date().toISOString()
    };
    dbData.orders.push(newOrder);
    save();
    return { rows: [newOrder] };
  }

  // 18. INSERT INTO public.order_items
  if (normalized.includes("INSERT INTO public.order_items")) {
    const [order_id, product_id, quantity, price] = params;
    const newItem: MockOrderItem = {
      id: crypto.randomUUID(),
      order_id: order_id as string,
      product_id: product_id as string,
      quantity: parseInt(quantity as string),
      price: parseFloat(price as string)
    };
    dbData.order_items.push(newItem);
    save();
    return { rows: [newItem] };
  }

  // 19. INSERT INTO public.reviews ... ON CONFLICT
  if (normalized.includes("INSERT INTO public.reviews")) {
    const [product_id, user_id, rating, comment] = params;
    const idx = dbData.reviews.findIndex((r: MockReview) => 
      r.product_id === product_id && r.user_id === user_id
    );
    const reviewData: Omit<MockReview, "id"> = {
      product_id: product_id as string,
      user_id: user_id as string,
      rating: parseInt(rating as string),
      comment: (comment as string) || null,
      created_at: new Date().toISOString()
    };

    if (idx !== -1) {
      dbData.reviews[idx] = {
        ...dbData.reviews[idx],
        ...reviewData
      };
      save();
      return { rows: [dbData.reviews[idx]] };
    } else {
      const newReview: MockReview = {
        id: crypto.randomUUID(),
        ...reviewData
      };
      dbData.reviews.push(newReview);
      save();
      return { rows: [newReview] };
    }
  }

  // 20. INSERT INTO public.blog_posts
  if (normalized.includes("INSERT INTO public.blog_posts")) {
    const [title, slug, content, image] = params;
    const newBlog: MockBlogPost = {
      id: crypto.randomUUID(),
      title: title as string,
      slug: slug as string,
      content: content as string,
      image: image as string,
      created_at: new Date().toISOString()
    };
    dbData.blog_posts.push(newBlog);
    save();
    return { rows: [newBlog] };
  }

  // 21. UPDATE public.products SET stock = GREATEST(0, stock - $1) WHERE id = $2
  if (normalized.includes("UPDATE public.products SET stock = GREATEST")) {
    const quantity = parseInt(params[0] as string);
    const productId = params[1] as string;
    const product = dbData.products.find((p: MockProduct) => p.id === productId);
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
      save();
    }
    return { rows: [] };
  }

  // 22. UPDATE public.products SET stock = $1 WHERE id = $2
  if (normalized.includes("UPDATE public.products SET stock = $1 WHERE id = $2")) {
    const stock = parseInt(params[0] as string);
    const productId = params[1] as string;
    const product = dbData.products.find((p: MockProduct) => p.id === productId);
    if (product) {
      product.stock = stock;
      save();
    }
    return { rows: [] };
  }

  // 23. UPDATE public.orders SET status = $1 WHERE id = $2
  if (normalized.includes("UPDATE public.orders SET status = $1 WHERE id = $2")) {
    const status = params[0] as string;
    const orderId = params[1] as string;
    const order = dbData.orders.find((o: MockOrder) => o.id === orderId);
    if (order) {
      order.status = status as string;
      save();
    }
    return { rows: [] };
  }

  // 24. UPDATE public.users SET name = $1, phone = $2 WHERE id = $3
  if (normalized.includes("UPDATE public.users SET name = $1, phone = $2 WHERE id = $3")) {
    const [name, phone, id] = params;
    const user = dbData.users.find((u: MockUser) => u.id === id);
    if (user) {
      user.name = name as string;
      user.phone = (phone as string) || null;
      save();
    }
    return { rows: [] };
  }

  // 25. UPDATE public.users SET is_verified = true, verification_token = null WHERE id = $1
  if (normalized.includes("UPDATE public.users SET is_verified = true")) {
    const id = params[0] as string;
    const user = dbData.users.find((u: MockUser) => u.id === id);
    if (user) {
      user.is_verified = true;
      user.verification_token = null;
      save();
    }
    return { rows: [] };
  }

  // 26. UPDATE public.addresses SET is_default = false WHERE user_id = $1
  if (normalized.includes("UPDATE public.addresses SET is_default = false WHERE user_id = $1")) {
    const userId = params[0] as string;
    dbData.addresses.forEach((addr: MockAddress) => {
      if (addr.user_id === userId) {
        addr.is_default = false;
      }
    });
    save();
    return { rows: [] };
  }

  // 27. DELETE FROM public.products WHERE id = $1
  if (normalized.includes("DELETE FROM public.products WHERE id = $1")) {
    const id = params[0] as string;
    dbData.products = dbData.products.filter((p: MockProduct) => p.id !== id);
    save();
    return { rows: [] };
  }

  // 28. DELETE FROM public.blog_posts WHERE id = $1
  if (normalized.includes("DELETE FROM public.blog_posts WHERE id = $1")) {
    const id = params[0] as string;
    dbData.blog_posts = dbData.blog_posts.filter((b: MockBlogPost) => b.id !== id);
    save();
    return { rows: [] };
  }

  // 29. DELETE FROM public.addresses WHERE id = $1 AND user_id = $2
  if (normalized.includes("DELETE FROM public.addresses WHERE id = $1 AND user_id = $2")) {
    const [id, user_id] = params;
    dbData.addresses = dbData.addresses.filter((addr: MockAddress) => 
      !(addr.id === id && addr.user_id === user_id)
    );
    save();
    return { rows: [] };
  }

  console.warn("Unrecognized mock query:", text, params);
  return { rows: [] };
};

export const query = async (text: string, params?: unknown[]) => {
  if (!process.env.DATABASE_URL) {
    return mockQuery(text, params || []);
  }
  const p = getDbPool();
  return p.query(text, params);
};


let dbInitialized = false;

export const initDb = async () => {
  if (dbInitialized) return;

  if (!process.env.DATABASE_URL) {
    initMockDbFile();
    dbInitialized = true;
    return;
  }

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

    // 2. Safely alter tables to support credentials, verification, and missing columns
    await query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;
    `);

    await query(`
      ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
    `);

    // Remove foreign keys linking to Supabase auth schema if they exist
    try {
      await query(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;`);
      await query(`ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();`);
    } catch (e) {
      console.error("Failed to alter users table constraints/defaults:", e);
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
        image: "/images/fresh_milky_mushrooms.png",
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
