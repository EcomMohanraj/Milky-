import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const res = await query("SELECT * FROM public.blog_posts WHERE slug = $1", [slug]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ blog: res.rows[0] });
  } catch (error) {
    console.error("GET Blog by Slug error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
