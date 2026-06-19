import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if parameter is a valid UUID, otherwise match against slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const sql = isUuid
      ? "SELECT * FROM public.products WHERE id = $1"
      : "SELECT * FROM public.products WHERE slug = $1";

    const res = await query(sql, [id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product: res.rows[0] });
  } catch (error) {
    console.error("GET Product error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
