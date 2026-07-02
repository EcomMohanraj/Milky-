import { SupabaseClient } from "@supabase/supabase-js";
import { Review } from "@/types";

/**
 * (a) Fetch reviews for a given product
 */
export async function getProductReviews(supabase: SupabaseClient, productId: string) {
  return await supabase
    .from("reviews")
    .select(`
      *,
      users (
        name
      )
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
}

/**
 * (b) Fetch top-rated reviews across all products for the homepage
 */
export async function getTopReviews(supabase: SupabaseClient) {
  return await supabase
    .from("reviews")
    .select(`
      *,
      users (
        name,
        addresses (
          city
        )
      )
    `)
    .eq("users.addresses.is_default", true)
    .gte("rating", 4)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);
}

/**
 * (c) Check if the current user is eligible to review a given product (has a qualifying order)
 */
export async function checkReviewEligibility(supabase: SupabaseClient, userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      order_items!inner (
        product_id
      )
    `)
    .eq("user_id", userId)
    .in("status", ["paid", "shipped", "delivered"])
    .eq("order_items.product_id", productId)
    .limit(1);

  if (error) {
    console.error("checkReviewEligibility error:", error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * (d) Submit a new review
 */
export async function submitReview(
  supabase: SupabaseClient,
  productId: string,
  userId: string,
  rating: number,
  comment: string | null
) {
  return await supabase
    .from("reviews")
    .upsert({
      product_id: productId,
      user_id: userId,
      rating,
      comment
    }, {
      onConflict: "product_id,user_id"
    })
    .select();
}
