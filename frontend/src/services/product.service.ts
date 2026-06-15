import { Product, Review, BlogPost } from "@/types";
import { apiFetch } from "./api-client";

export const productService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const res = await apiFetch("/api/products");
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("getProducts failed:", err);
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await apiFetch(`/api/products/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("getProductBySlug failed:", err);
      return null;
    }
  },

  async updateProductStock(id: string, newStock: number): Promise<void> {
    try {
      await apiFetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch (err) {
      console.error("updateProductStock failed:", err);
    }
  },

  async addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
    const res = await apiFetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add product");
    }
    return await res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await apiFetch(`/api/products/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("deleteProduct failed:", err);
    }
  },

  // REVIEWS
  async getReviews(productId: string): Promise<Review[]> {
    try {
      const res = await apiFetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("getReviews failed:", err);
      return [];
    }
  },

  async createReview(review: Omit<Review, "id" | "created_at">, userName: string): Promise<Review> {
    const res = await apiFetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to submit review");
    }
    return await res.json();
  },

  // BLOG POSTS
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const res = await apiFetch("/api/blogs");
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("getBlogPosts failed:", err);
      return [];
    }
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const res = await apiFetch(`/api/blogs/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("getBlogPostBySlug failed:", err);
      return null;
    }
  },

  async createBlogPost(blog: Omit<BlogPost, "id" | "created_at">): Promise<BlogPost> {
    const res = await apiFetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to publish article");
    }
    return await res.json();
  },

  async deleteBlogPost(id: string): Promise<void> {
    try {
      await apiFetch(`/api/blogs/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("deleteBlogPost failed:", err);
    }
  },
};
