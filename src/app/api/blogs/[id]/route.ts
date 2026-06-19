import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if parameter is a valid UUID, otherwise match against slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const sql = isUuid
      ? "SELECT * FROM public.blog_posts WHERE id = $1"
      : "SELECT * FROM public.blog_posts WHERE slug = $1";

    const res = await query(sql, [id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ blog: res.rows[0] });
  } catch (error) {
    console.error("GET Blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await query("DELETE FROM public.blog_posts WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE blog error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
