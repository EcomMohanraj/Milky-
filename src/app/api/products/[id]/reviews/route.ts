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

    return NextResponse.json({ reviews: res.rows });
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
