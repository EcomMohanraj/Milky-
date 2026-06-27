import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query } from "@/lib/db";
import { Resend } from "resend";

function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.includes("@") && email.length > 3;
}

function isValidPhone(phone: string): boolean {
  if (typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
}

async function sendSMS(toNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[SMS MOCK LOG] To: ${toNumber}\nMessage:\n${message}\n(Set TWILIO environment variables for real dispatch)`);
    return { success: true };
  }

  try {
    let formattedTo = toNumber.trim();
    if (!formattedTo.startsWith("+")) {
      const digits = formattedTo.replace(/\D/g, "");
      if (digits.length === 10) {
        formattedTo = "+91" + digits;
      } else {
        formattedTo = "+" + digits;
      }
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: formattedTo,
        Body: message
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to dispatch SMS via Twilio API." };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

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

    const { status, tracking_id, courier_name } = await request.json();
    if (status === undefined && tracking_id === undefined && courier_name === undefined) {
      return NextResponse.json({ error: "At least one parameter is required." }, { status: 400 });
    }

    // 1. Fetch current order details
    const existingResult = await query(
      `SELECT o.id, o.tracking_id, o.courier_name, o.status, u.email, u.name, u.phone 
       FROM public.orders o 
       JOIN public.users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const existingOrder = existingResult.rows[0];

    // Determine duplicate and notification logic
    const isDuplicate = tracking_id !== undefined && tracking_id !== null && tracking_id === existingOrder.tracking_id;
    const shouldNotify = !isDuplicate && tracking_id;

    let finalStatus = status;
    if (tracking_id && (!finalStatus || finalStatus === "paid" || finalStatus === "pending")) {
      finalStatus = "shipped";
    }

    // 2. Perform DB update
    if (tracking_id !== undefined || courier_name !== undefined) {
      const finalTracking = tracking_id !== undefined ? tracking_id : existingOrder.tracking_id;
      const finalCourier = courier_name !== undefined ? courier_name : existingOrder.courier_name;
      
      await query(
        "UPDATE public.orders SET status = $1, tracking_id = $2, courier_name = $3 WHERE id = $4",
        [finalStatus || "shipped", finalTracking, finalCourier, id]
      );
    } else if (finalStatus) {
      await query("UPDATE public.orders SET status = $1 WHERE id = $2", [finalStatus, id]);
    }

    let emailSent = false;
    let smsSent = false;
    let emailError: string | null = null;
    let smsError: string | null = null;

    // 3. Dispatch notifications if tracking ID is new or changed
    if (shouldNotify) {
      const customerEmail = existingOrder.email;
      const customerName = existingOrder.name || "Customer";
      const customerPhone = existingOrder.phone || "";
      const courierNameDisplay = courier_name || existingOrder.courier_name || "India Post";
      const orderIdShort = id.substring(0, 8);
      const trackingUrl = courierNameDisplay.toLowerCase().includes("india post")
        ? "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
        : "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"; // default tracking fallback

      // 3.1 Send Email
      if (isValidEmail(customerEmail)) {
        try {
          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #fcfdfa; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <!-- Header with Brand Branding -->
                <div style="background-color: #15803d; padding: 32px 24px; text-align: center; border-bottom: 4px solid #166534;">
                  <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; font-family: sans-serif;">🍄 Milky Mushrooms</div>
                  <p style="color: #d1fae5; margin: 8px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Order Despatched</p>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 32px 24px; color: #333333; line-height: 1.6;">
                  <h2 style="color: #15803d; font-size: 18px; margin-top: 0; font-weight: 800;">Hi ${customerName},</h2>
                  <p style="font-size: 14px;">Great news! Your Milky Mushrooms order has been shipped and is on its way to you.</p>
                  
                  <!-- Shipment Details Card -->
                  <div style="background-color: #f3f6f1; border-radius: 8px; padding: 20px; border-left: 4px solid #15803d; margin: 24px 0;">
                    <h3 style="color: #15803d; margin-top: 0; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Details</h3>
                    <p style="margin: 6px 0; font-size: 13px;"><strong>Order ID:</strong> <span style="font-family: monospace;">${id}</span></p>
                    <p style="margin: 6px 0; font-size: 13px;"><strong>Courier Name:</strong> ${courierNameDisplay}</p>
                    <p style="margin: 6px 0; font-size: 13px;"><strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #15803d;">${tracking_id}</span></p>
                    <p style="margin: 6px 0; font-size: 13px;"><strong>Shipment Status:</strong> Shipped</p>
                    <p style="margin: 6px 0; font-size: 13px; color: #666;"><strong>Estimated Delivery:</strong> 3-5 business days</p>
                  </div>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${trackingUrl}" target="_blank" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(21, 128, 61, 0.3);">Track Your Shipment</a>
                  </div>
                  
                  <p style="font-size: 12px; color: #666666; margin-top: 24px; text-align: center; line-height: 1.4;">
                    If the button above doesn't work, you can track this using India Post's tracking page at:<br/>
                    <a href="${trackingUrl}" style="color: #15803d; text-decoration: underline;">${trackingUrl}</a>
                  </p>
                  
                  <p style="font-size: 14px; margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-weight: bold;">Warm regards,<br/><span style="color: #15803d;">The Milky Mushrooms Team</span></p>
                </div>
                
                <!-- Footer with Contact Info -->
                <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 8px;">Questions or need help? Contact support at <a href="mailto:support@milkymushroom.in" style="color: #15803d;">support@milkymushroom.in</a> or call <a href="tel:+919988776655" style="color: #15803d;">+91 99887 76655</a></p>
                  <p style="margin: 0;">This email was sent to ${customerEmail}. Thank you for shopping organic!</p>
                </div>
              </div>
            `;

            const resend = new Resend(apiKey);
            await resend.emails.send({
              from: "Milky Mushrooms <orders@milkymushroom.in>",
              to: customerEmail,
              subject: "📦 Your Order Has Been Shipped",
              html: emailHtml
            });
            emailSent = true;
          } else {
            emailError = "RESEND_API_KEY is not defined in environment variables.";
            console.warn("RESEND_API_KEY is not defined. Email skipped.");
          }
        } catch (err) {
          emailError = err instanceof Error ? err.message : "Error sending email notification.";
          console.error("Resend API failed:", err);
        }
      } else {
        emailError = `Invalid email address registered for customer: '${customerEmail}'`;
        console.warn(emailError);
      }

      // 3.2 Send SMS
      if (isValidPhone(customerPhone)) {
        const smsMessage = `Dear ${customerName},\n\nGreat news! Your order #${orderIdShort} has been shipped via ${courierNameDisplay}.\n\nTracking ID:\n${tracking_id}\n\nTrack your shipment:\n${trackingUrl}\n\nThank you for shopping with us.`;
        const smsResult = await sendSMS(customerPhone, smsMessage);
        smsSent = smsResult.success;
        if (!smsResult.success) {
          smsError = smsResult.error || "SMS API failure.";
          console.error("SMS Dispatch failed:", smsError);
        }
      } else {
        smsError = `Customer does not have a valid mobile number: '${customerPhone}'`;
        console.warn(smsError);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      smsSent,
      emailError,
      smsError,
      notified: shouldNotify
    });
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
