import { Product, Review, BlogPost } from "@/types";
import { supabase, isSupabaseConfigured, getLocalStorageItem, setLocalStorageItem } from "./api-client";

// Mock Seed Data (Matching schema.sql)
export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Premium Fresh Milky Mushrooms",
    slug: "premium-fresh-milky-mushrooms",
    description: "Freshly harvested organic Milky Mushrooms (Calocybe indica) directly from our farm beds. These mushrooms are known for their firm, meaty texture, milky white appearance, and long shelf life. Perfect for stir-fries, soups, and curries.",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&q=80&w=600",
    price: 240.0,
    stock: 100,
    category: "Fresh",
    nutrition: {
      calories: "22 kcal",
      protein: "3.1g",
      carbohydrates: "4.3g",
      fat: "0.2g",
      fiber: "2.5g",
    },
  },
  {
    id: "prod-2",
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
      fiber: "18.4g",
    },
  },
  {
    id: "prod-3",
    name: "Milky Mushroom Cultivation Spawn",
    slug: "milky-mushroom-spawn",
    description: "High-quality, laboratory-grown, fully colonized grain spawn of Calocybe indica. Cultivated on sorghum grains under strict sterile conditions. Ideal for mushroom growers looking to inoculate straw beds.",
    image: "/images/milky_mushroom_spawn.png",
    price: 120.0,
    stock: 200,
    category: "Spawn",
    nutrition: {
      usage: "Mushroom cultivation beds",
    },
  },
  {
    id: "prod-4",
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
      fiber: "19.0g",
    },
  },
];

export const SEED_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
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
    created_at: new Date().toISOString(),
  },
  {
    id: "blog-2",
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
    created_at: new Date().toISOString(),
  },
  {
    id: "blog-3",
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
    created_at: new Date().toISOString(),
  },
  {
    id: "blog-4",
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
    created_at: new Date().toISOString(),
  },
];

export const SEED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    product_id: "prod-1",
    user_id: "user-1",
    rating: 5,
    comment: "Absolutely fresh and high quality. The milky mushrooms were firm and delicious in our mushroom biryani!",
    created_at: new Date().toISOString(),
    user_name: "Ramesh Kumar",
  },
  {
    id: "rev-2",
    product_id: "prod-1",
    user_id: "user-2",
    rating: 4,
    comment: "Freshly delivered in Dindigul. Very neat packaging. Will order again.",
    created_at: new Date().toISOString(),
    user_name: "Priyanka S.",
  },
  {
    id: "rev-3",
    product_id: "prod-2",
    user_id: "user-3",
    rating: 5,
    comment: "These dried slices are amazing. Once rehydrated they retain the original farm fresh texture.",
    created_at: new Date().toISOString(),
    user_name: "Anand Harrison",
  },
];

function fixImage(image: string): string {
  if (!image) return image;
  if (image.includes("photo-1504387828074-ab75684db3ff")) {
    return "/images/dried_milky_mushrooms.png";
  }
  if (image.includes("photo-1511289081367-46c54b5f4ea7")) {
    return "/images/milky_mushroom_spawn.png";
  }
  if (image.includes("photo-1608797178974-15b35a61d121")) {
    return "/images/milky_mushroom_powder.png";
  }
  if (image.includes("photo-1594911774802-8822a7079ae1")) {
    return "/images/spicy_mushroom_fry.png";
  }
  if (image.includes("photo-1547592165-e1d17fed6005")) {
    return "/images/creamy_mushroom_soup.png";
  }
  return image;
}

export const productService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    let products: Product[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data && data.length > 0) {
          products = data as Product[];
        } else {
          console.warn("Supabase products returned empty or error, falling back to local/seed: ", error);
          products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
        }
      } catch (err) {
        console.error("Supabase products fetch failed, falling back: ", err);
        products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
      }
    } else {
      products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
    }
    return products.map((p) => ({ ...p, image: fixImage(p.image) }));
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();
        if (!error && data) {
          const p = data as Product;
          return { ...p, image: fixImage(p.image) };
        }
      } catch (err) {
        console.error("Supabase getProductBySlug failed, falling back: ", err);
      }
    }
    const products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
    const p = products.find((p) => p.slug === slug) || null;
    return p ? { ...p, image: fixImage(p.image) } : null;
  },

  async updateProductStock(id: string, newStock: number): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
        if (!error) return;
        console.warn("Supabase updateProductStock returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase updateProductStock failed, falling back: ", err);
      }
    }
    const products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
    const updated = products.map((p) => (p.id === id ? { ...p, stock: newStock } : p));
    setLocalStorageItem("milky_products", updated);
  },

  async addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: "prod-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert(newProduct)
          .select()
          .single();
        if (!error && data) return data as Product;
        console.warn("Supabase addProduct returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase addProduct failed, falling back: ", err);
      }
    }
    const products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
    products.push(newProduct);
    setLocalStorageItem("milky_products", products);
    return newProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) return;
        console.warn("Supabase deleteProduct returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase deleteProduct failed, falling back: ", err);
      }
    }
    const products = getLocalStorageItem("milky_products", SEED_PRODUCTS);
    const filtered = products.filter((p) => p.id !== id);
    setLocalStorageItem("milky_products", filtered);
  },

  // REVIEWS
  async getReviews(productId: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*, users(name)")
          .eq("product_id", productId);
        if (!error && data) {
          interface SupabaseReviewRow {
            id: string;
            product_id: string;
            user_id: string;
            rating: number;
            comment: string;
            created_at: string;
            users: { name: string } | null;
          }
          return (data as unknown as SupabaseReviewRow[]).map((d) => ({
            id: d.id,
            product_id: d.product_id,
            user_id: d.user_id,
            rating: d.rating,
            comment: d.comment,
            created_at: d.created_at,
            user_name: d.users?.name || "Verified Buyer",
          })) as Review[];
        }
      } catch (err) {
        console.error("Supabase getReviews failed, falling back: ", err);
      }
    }
    const reviews = getLocalStorageItem<Review[]>("milky_reviews", SEED_REVIEWS);
    return reviews.filter((r) => r.product_id === productId);
  },

  async createReview(review: Omit<Review, "id" | "created_at">, userName: string): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      user_name: userName,
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .insert({
            product_id: review.product_id,
            user_id: review.user_id,
            rating: review.rating,
            comment: review.comment,
          })
          .select()
          .single();
        if (!error && data) return { ...data, user_name: userName } as Review;
        console.warn("Supabase createReview returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase createReview failed, falling back: ", err);
      }
    }
    const reviews = getLocalStorageItem<Review[]>("milky_reviews", SEED_REVIEWS);
    reviews.push(newReview);
    setLocalStorageItem("milky_reviews", reviews);
    return newReview;
  },

  // BLOG POSTS
  async getBlogPosts(): Promise<BlogPost[]> {
    let blogs: BlogPost[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("blog_posts").select("*");
        if (!error && data && data.length > 0) {
          blogs = data as BlogPost[];
        } else {
          console.warn("Supabase blog posts returned empty or error, falling back to local/seed: ", error);
          blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
        }
      } catch (err) {
        console.error("Supabase blog posts fetch failed, falling back: ", err);
        blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
      }
    } else {
      blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
    }
    return blogs.map((b) => ({ ...b, image: fixImage(b.image) }));
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .single();
        if (!error && data) {
          const b = data as BlogPost;
          return { ...b, image: fixImage(b.image) };
        }
      } catch (err) {
        console.error("Supabase getBlogPostBySlug failed, falling back: ", err);
      }
    }
    const blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
    const b = blogs.find((b) => b.slug === slug) || null;
    return b ? { ...b, image: fixImage(b.image) } : null;
  },

  async createBlogPost(blog: Omit<BlogPost, "id" | "created_at">): Promise<BlogPost> {
    const newBlog: BlogPost = {
      ...blog,
      id: "blog-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(newBlog)
          .select()
          .single();
        if (!error && data) return data as BlogPost;
        console.warn("Supabase createBlogPost returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase createBlogPost failed, falling back: ", err);
      }
    }
    const blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
    blogs.push(newBlog);
    setLocalStorageItem("milky_blogs", blogs);
    return newBlog;
  },

  async deleteBlogPost(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (!error) return;
        console.warn("Supabase deleteBlogPost returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase deleteBlogPost failed, falling back: ", err);
      }
    }
    const blogs = getLocalStorageItem("milky_blogs", SEED_BLOGS);
    const filtered = blogs.filter((b) => b.id !== id);
    setLocalStorageItem("milky_blogs", filtered);
  },
};
