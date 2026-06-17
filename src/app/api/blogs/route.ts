import { NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET() {
  try {
    await initDb();
    const res = await query("SELECT * FROM public.blog_posts ORDER BY created_at DESC");
    return NextResponse.json({ blogs: res.rows });
  } catch (error) {
    console.error("GET Blogs error:", error);
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

    const { title, slug, content, image } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required blog fields." }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO public.blog_posts (title, slug, content, image)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, slug, content, image || ""]
    );

    return NextResponse.json({ blog: res.rows[0] });
  } catch (error) {
    console.error("POST Blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
