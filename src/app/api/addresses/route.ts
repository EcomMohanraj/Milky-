import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await query(
      "SELECT * FROM public.addresses WHERE user_id = $1 ORDER BY created_at DESC",
      [decoded.id as string]
    );

    return NextResponse.json({ addresses: res.rows });
  } catch (error) {
    console.error("GET Addresses API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { address, city, pincode, is_default } = await request.json();

    if (!address || !city || !pincode) {
      return NextResponse.json({ error: "Address, city, and pincode are required." }, { status: 400 });
    }

    if (is_default) {
      // Clear other default addresses for this user
      await query("UPDATE public.addresses SET is_default = false WHERE user_id = $1", [decoded.id as string]);
    }

    const res = await query(
      `INSERT INTO public.addresses (user_id, address, city, pincode, is_default)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [decoded.id as string, address, city, pincode, !!is_default]
    );

    return NextResponse.json({ address: res.rows[0] });
  } catch (error) {
    console.error("POST Address API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
