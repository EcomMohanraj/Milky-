import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { Resend } from "resend";

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

      // Send Order Confirmation Email (isolated in try-catch so it doesn't block payment success response)
      try {
        const orderResult = await query(
          `SELECT o.id, o.amount, o.address, u.email, u.name 
           FROM public.orders o 
           JOIN public.users u ON o.user_id = u.id 
           WHERE o.id = $1`,
          [order_id]
        );

        const orders = orderResult.rows as unknown as Array<{ id: string; amount: number; address: string; email: string; name: string }>;

        if (orders.length > 0) {
          const order = orders[0];
          const customerEmail = order.email;
          const customerName = order.name || "Customer";

          const itemsResult = await query(
            `SELECT oi.quantity, oi.price, p.name 
             FROM public.order_items oi 
             JOIN public.products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [order_id]
          );
          const items = itemsResult.rows as unknown as Array<{ name: string; quantity: number; price: number }>;

          const orderIdShort = order.id.substring(0, 8);
          const apiKey = process.env.RESEND_API_KEY;

          console.log("EMAIL DEBUG: customer email =", customerEmail);
          console.log("EMAIL DEBUG: RESEND_API_KEY present =", !!process.env.RESEND_API_KEY);

          if (apiKey) {
            const itemsHtml = items
              .map(
                (item: { name: string; quantity: number; price: number }) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: left;">${item.name}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
              )
              .join("");

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #fcfdfa;">
                <!-- Header -->
                <div style="background-color: #15803d; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Milky Mushrooms</h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                  <p style="font-size: 14px;">Thank you for your purchase! We are pleased to confirm that your payment has been successfully processed and your order is now being prepared for shipping.</p>
                  
                  <!-- Order Summary -->
                  <div style="background-color: #f3f6f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <h3 style="color: #15803d; margin-top: 0; margin-bottom: 12px; font-size: 15px;">Order Summary</h3>
                    <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> ${order.id}</p>
                    <p style="margin: 4px 0; font-size: 13px;"><strong>Shipping Address:</strong> ${order.address}</p>
                  </div>
                  
                  <!-- Items Table -->
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
                    <thead>
                      <tr style="background-color: #e2ebd9; color: #15803d;">
                        <th style="padding: 8px; text-align: left;">Item</th>
                        <th style="padding: 8px; text-align: center;">Qty</th>
                        <th style="padding: 8px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                      <tr>
                        <td colspan="2" style="padding: 12px 8px 8px; text-align: right; font-weight: bold;">Total Paid:</td>
                        <td style="padding: 12px 8px 8px; text-align: right; font-weight: bold; color: #15803d; font-size: 15px;">₹${Number(order.amount).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style="font-size: 14px; margin-top: 24px; margin-bottom: 0;">Warm regards,<br /><strong>The Milky Mushrooms Team</strong></p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0;">This email was sent to ${customerEmail}. If you have any questions, please contact our support team.</p>
                </div>
              </div>
            `;

            const resend = new Resend(apiKey);
            try {
              const emailResult = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: customerEmail,
                subject: `Order Confirmed - Milky Mushrooms #${orderIdShort}`,
                html: emailHtml
              });
              console.log("EMAIL DEBUG: send result =", JSON.stringify(emailResult));
            } catch (emailError) {
              console.error("EMAIL DEBUG: send failed with error =", emailError);
            }
          } else {
            console.warn("RESEND_API_KEY is not defined. Skipping confirmation email sending.");
          }
        }
      } catch (emailErr) {
        console.error("Failed to send order confirmation email:", emailErr);
      }

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
