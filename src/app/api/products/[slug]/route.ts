import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const res = await query("SELECT * FROM public.products WHERE slug = $1", [slug]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product: res.rows[0] });
  } catch (error) {
    console.error("GET Product by Slug error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
