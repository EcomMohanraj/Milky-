import { NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const res = await query("SELECT * FROM public.users WHERE email = $1", [email.toLowerCase()]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = res.rows[0];

    // Validate password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify email status
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email before logging in." }, { status: 403 });
    }

    // Sign JWT
    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const payload = {
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as string,
    };
    const token = await signJwt(payload, secret);

    // Set JWT in cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true, user: payload });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
