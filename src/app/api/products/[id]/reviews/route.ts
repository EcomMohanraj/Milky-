import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Join with users table to get the name of the user who left the review
    const res = await query(
      `SELECT r.*, u.name as user_name 
       FROM public.reviews r
       JOIN public.users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    // Check if the current logged-in user can leave a review (verified purchase)
    let canReview = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
        const decoded = await verifyJwt(token, secret);
        if (decoded && decoded.id) {
          const checkRes = await query(
            `SELECT 1 
             FROM public.orders o
             JOIN public.order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1 
               AND oi.product_id = $2 
               AND o.status IN ('paid', 'shipped', 'delivered')
             LIMIT 1`,
            [decoded.id as string, id]
          );
          canReview = checkRes.rows.length > 0;
        }
      }
    } catch (e) {
      // Ignore auth/verification errors when checking eligibility for GET
    }

    return NextResponse.json({ reviews: res.rows, canReview });
  } catch (error) {
    console.error("GET product reviews error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    // Verify purchase status
    const checkRes = await query(
      `SELECT 1 
       FROM public.orders o
       JOIN public.order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 
         AND oi.product_id = $2 
         AND o.status IN ('paid', 'shipped', 'delivered')
       LIMIT 1`,
      [decoded.id as string, id]
    );

    if (checkRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Only customers who have purchased this product can leave a review." }, 
        { status: 403 }
      );
    }

    const res = await query(
      `INSERT INTO public.reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, user_id) 
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
       RETURNING *`,
      [id, decoded.id as string, rating, comment || null]
    );

    return NextResponse.json({ review: { ...res.rows[0], user_name: decoded.name as string } });
  } catch (error) {
    console.error("POST product review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
