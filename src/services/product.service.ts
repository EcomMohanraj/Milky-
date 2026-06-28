import { Product, Review, BlogPost } from "@/types";

export const productService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const res = await fetch("/api/products");
    if (!res.ok) {
      const errorText = await res.text().catch(() => "No error details available");
      throw new Error(`Server returned status ${res.status} (${res.statusText}): ${errorText}`);
    }
    const data = await res.json();
    return data.products as Product[];
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.product as Product;
    } catch (err) {
      console.error("getProductBySlug error:", err);
      return null;
    }
  },

  async updateProductStock(id: string, newStock: number): Promise<void> {
    const res = await fetch(`/api/products/${id}/control`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update product stock.");
    }
  },

  async addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add product.");
    }

    const data = await res.json();
    return data.product as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}/control`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete product.");
    }
  },

  // REVIEWS
  async getReviews(productId: string): Promise<{ reviews: Review[]; canReview: boolean }> {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) return { reviews: [], canReview: false };
      const data = await res.json();
      return {
        reviews: (data.reviews || []) as Review[],
        canReview: !!data.canReview
      };
    } catch (err) {
      console.error("getReviews error:", err);
      return { reviews: [], canReview: false };
    }
  },

  async getTopReviews(): Promise<Review[]> {
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) return [];
      const data = await res.json();
      return data.reviews as Review[];
    } catch (err) {
      console.error("getTopReviews error:", err);
      return [];
    }
  },

  async createReview(review: Omit<Review, "id" | "created_at">, _userName: string): Promise<Review> {
    const res = await fetch(`/api/products/${review.product_id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: review.rating,
        comment: review.comment
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create review.");
    }

    const data = await res.json();
    return data.review as Review;
  },

  // BLOG POSTS
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const res = await fetch("/api/blogs");
      if (!res.ok) return [];
      const data = await res.json();
      return data.blogs as BlogPost[];
    } catch (err) {
      console.error("getBlogPosts error:", err);
      return [];
    }
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const res = await fetch(`/api/blogs/${slug}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.blog as BlogPost;
    } catch (err) {
      console.error("getBlogPostBySlug error:", err);
      return null;
    }
  },

  async createBlogPost(blog: Omit<BlogPost, "id" | "created_at">): Promise<BlogPost> {
    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to publish blog post.");
    }

    const data = await res.json();
    return data.blog as BlogPost;
  },

  async deleteBlogPost(id: string): Promise<void> {
    const res = await fetch(`/api/blogs/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete blog post.");
    }
  },
};
