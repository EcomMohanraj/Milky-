import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query, initDb } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await query(
      `DELETE FROM public.inquiries WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully." });
  } catch (error) {
    console.error("DELETE admin inquiry error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
