import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "mocksecretkey";

    // Recreate Razorpay signature comparison hash
    const hash = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isVerified = hash === razorpay_signature;

    if (isVerified) {
      // Mark the order as paid in the database
      await query(
        `UPDATE public.orders 
         SET status = 'paid', payment_id = $1 
         WHERE id = $2`,
        [razorpay_payment_id, order_id]
      );

      return NextResponse.json({
        verified: true,
        message: "Payment signature verified successfully.",
      });
    } else {
      return NextResponse.json(
        { verified: false, error: "Invalid payment signature." },
        { status: 400 }
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { verified: false, error: errorMessage },
      { status: 500 }
    );
  }
}
