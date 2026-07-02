import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const res = await query(
      `SELECT r.*, u.name as user_name, p.name as product_name, COALESCE(a.city, 'Verified Buyer') as location 
       FROM public.reviews r 
       JOIN public.users u ON r.user_id = u.id 
       JOIN public.products p ON r.product_id = p.id
       LEFT JOIN (
         SELECT DISTINCT ON (user_id) user_id, city 
         FROM public.addresses 
         WHERE is_default = true 
         ORDER BY user_id, created_at DESC
       ) a ON a.user_id = u.id
       WHERE r.rating >= 4 
       ORDER BY r.rating DESC, r.created_at DESC 
       LIMIT 6`
    );
    return NextResponse.json({ reviews: res.rows });
  } catch (error) {
    console.error("GET top reviews error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
