import { NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
  try {
    await initDb();
    const res = await query("SELECT * FROM public.products ORDER BY created_at DESC");
    return NextResponse.json({ products: res.rows });
  } catch (error) {
    console.error("GET Products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { name, slug, description, image, price, stock, category, nutrition } = await request.json();

    if (!name || !slug || !description || !price || !category) {
      return NextResponse.json({ error: "Missing required product fields." }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO public.products (name, slug, description, image, price, stock, category, nutrition)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, slug, description, image || "", price, stock || 0, category, JSON.stringify(nutrition || {})]
    );

    return NextResponse.json({ product: res.rows[0] });
  } catch (error) {
    console.error("POST Product error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
