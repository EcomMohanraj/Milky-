import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { query } from "@/lib/db";
import Razorpay from "razorpay";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let res;
    if (decoded.role === "admin") {
      // Admins see all orders
      res = await query(`
        SELECT o.*, 
               COALESCE(json_agg(json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product', json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'price', p.price,
                   'image', p.image
                 )
               )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
        FROM public.orders o
        LEFT JOIN public.order_items oi ON o.id = oi.order_id
        LEFT JOIN public.products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
    } else {
      // Normal users only see their own orders
      res = await query(`
        SELECT o.*, 
               COALESCE(json_agg(json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'product', json_build_object(
                   'id', p.id,
                   'name', p.name,
                   'price', p.price,
                   'image', p.image
                 )
               )) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
        FROM public.orders o
        LEFT JOIN public.order_items oi ON o.id = oi.order_id
        LEFT JOIN public.products p ON oi.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [decoded.id as string]);
    }

    return NextResponse.json({ orders: res.rows });
  } catch (error) {
    console.error("GET Orders API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

interface OrderItemPayload {
  product_id: string;
  quantity: number;
  price: number;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.SESSION_SECRET || "milky-mushrooms-super-secret-key-15803d-green";
    const decoded = await verifyJwt(token, secret);

    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, status, payment_id, address, items } = await request.json();

    if (!amount || !address || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
    }

    // Insert order
    const orderRes = await query(
      `INSERT INTO public.orders (user_id, amount, status, payment_id, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [decoded.id as string, amount, status || "pending", payment_id || null, address]
    );
    const order = orderRes.rows[0];

    // Insert items & update product stock
    const insertedItems = [];
    for (const item of items as OrderItemPayload[]) {
      const itemRes = await query(
        `INSERT INTO public.order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [order.id, item.product_id, item.quantity, item.price]
      );
      insertedItems.push(itemRes.rows[0]);

      // Deduct stock
      await query(
        `UPDATE public.products 
         SET stock = GREATEST(0, stock - $1) 
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Create Razorpay Order ID if in real mode and order is pending
    let razorpayOrderId = null;
    const isMock = process.env.NEXT_PUBLIC_MOCK_PAYMENT !== "false";
    if (!isMock && (!status || status === "pending")) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(amount * 100), // in paise
          currency: "INR",
          receipt: order.id,
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
        throw new Error("Failed to initialize payment gateway order.");
      }
    }

    return NextResponse.json({ 
      order: { 
        ...order, 
        items: insertedItems,
        razorpay_order_id: razorpayOrderId
      } 
    });
  } catch (error) {
    console.error("POST Order API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
