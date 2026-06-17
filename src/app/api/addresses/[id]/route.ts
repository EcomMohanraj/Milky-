import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership before deleting
    await query("DELETE FROM public.addresses WHERE id = $1 AND user_id = $2", [id, decoded.id as string]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Address API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
