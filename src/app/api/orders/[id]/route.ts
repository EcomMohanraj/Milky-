import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query } from "@/lib/db";
import { Resend } from "resend";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const { status, tracking_id } = await request.json();
    if (status === undefined && tracking_id === undefined) {
      return NextResponse.json({ error: "Either status or tracking_id is required." }, { status: 400 });
    }

    let finalStatus = status;
    if (tracking_id && (!finalStatus || finalStatus === "paid" || finalStatus === "pending")) {
      finalStatus = "shipped";
    }

    if (tracking_id !== undefined) {
      await query(
        "UPDATE public.orders SET status = $1, tracking_id = $2 WHERE id = $3",
        [finalStatus || "shipped", tracking_id, id]
      );
    } else if (finalStatus) {
      await query("UPDATE public.orders SET status = $1 WHERE id = $2", [finalStatus, id]);
    }

    // Send shipment notification email if a tracking ID was saved
    if (tracking_id) {
      try {
        const orderResult = await query(
          `SELECT o.id, u.email, u.name 
           FROM public.orders o 
           JOIN public.users u ON o.user_id = u.id 
           WHERE o.id = $1`,
          [id]
        );

        const orders = orderResult.rows as unknown as Array<{ id: string; email: string; name: string }>;

        if (orders.length > 0) {
          const order = orders[0];
          const customerEmail = order.email;
          const customerName = order.name || "Customer";
          const orderIdShort = order.id.substring(0, 8);
          const apiKey = process.env.RESEND_API_KEY;

          if (apiKey) {
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #fcfdfa;">
                <!-- Header -->
                <div style="background-color: #15803d; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Milky Mushrooms</h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>
                  <p style="font-size: 14px;">Great news! Your Milky Mushrooms order has shipped and is on the way.</p>
                  
                  <!-- Shipment Details -->
                  <div style="background-color: #f3f6f1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <h3 style="color: #15803d; margin-top: 0; margin-bottom: 12px; font-size: 15px;">Shipment Details</h3>
                    <p style="margin: 4px 0; font-size: 13px;"><strong>Order ID:</strong> ${order.id}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #15803d;">${tracking_id}</span></p>
                  </div>
                  
                  <p style="font-size: 14px;">
                    You can track this using India Post's tracking page at 
                    <a href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx" style="color: #15803d; font-weight: bold; text-decoration: underline;">India Post Tracking</a> 
                    or your courier's tracking page, using the tracking ID above.
                  </p>
                  
                  <p style="font-size: 14px; margin-top: 24px; margin-bottom: 0;">Warm regards,<br /><strong>The Milky Mushrooms Team</strong></p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0;">This email was sent to ${customerEmail}. If you have any questions, please contact our support team.</p>
                </div>
              </div>
            `;

            const resend = new Resend(apiKey);
            await resend.emails.send({
              from: "Milky Mushrooms <orders@milkymushroom.in>",
              to: customerEmail,
              subject: `Your Milky Mushrooms order has shipped! - #${orderIdShort}`,
              html: emailHtml
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to send shipping notification email:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Order API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await query("DELETE FROM public.orders WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Order API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
