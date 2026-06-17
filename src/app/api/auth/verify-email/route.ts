import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=Missing+token", request.url));
    }

    const res = await query("SELECT id FROM public.users WHERE verification_token = $1", [token]);
    if (res.rows.length === 0) {
      return NextResponse.redirect(new URL("/login?error=Invalid+or+expired+token", request.url));
    }

    const userId = res.rows[0].id;
    await query(
      "UPDATE public.users SET is_verified = true, verification_token = null WHERE id = $1",
      [userId]
    );

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("Verify Email API error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
}
