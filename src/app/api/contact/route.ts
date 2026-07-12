import { NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    await initDb();
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: "Phone number must be at least 10 digits." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    // Insert inquiry into database
    await query(
      `INSERT INTO public.inquiries (name, email, phone, message)
       VALUES ($1, $2, $3, $4)`,
      [name, email, phone, message]
    );

    return NextResponse.json({ success: true, message: "Inquiry submitted successfully." });
  } catch (error) {
    console.error("Contact API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
