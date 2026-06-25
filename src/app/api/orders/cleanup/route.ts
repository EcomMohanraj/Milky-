import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  try {
    // Optional: check Authorization header for Bearer CRON_SECRET, or ?secret= query parameter
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
      const isQueryValid = querySecret === cronSecret;
      if (!isHeaderValid && !isQueryValid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const result = await query(
      "UPDATE public.orders SET status = 'failed' WHERE status = 'pending' AND created_at < $1",
      [oneHourAgo]
    );

    const count = result.rowCount || 0;

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${count} pending orders older than 1 hour.`,
      cleanedUpCount: count
    });
  } catch (error) {
    console.error("Order cleanup API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
