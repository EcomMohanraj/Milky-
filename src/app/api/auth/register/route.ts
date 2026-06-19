import { NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await initDb();
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long." }, { status: 400 });
    }

    // Check if email already exists
    const existing = await query("SELECT id FROM public.users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 400 });
    }

    // Hash password
    const hashedPw = await bcrypt.hash(password, 10);

    // Generate random verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create user
    const role = email.toLowerCase() === "admin@milky.com" ? "admin" : "customer";
    await query(
      `INSERT INTO public.users (name, email, phone, role, password_hash, is_verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, email.toLowerCase(), phone || null, role, hashedPw, false, verificationToken]
    );

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify email.",
      verificationToken, // Returned so the frontend can generate a mock verification link for testing.
    });
  } catch (error) {
    console.error("Register API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
