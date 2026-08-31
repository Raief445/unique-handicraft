import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Disable caching for this route so it always hits the database
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Perform a lightweight query to ensure the database connection stays active
    // and wakes up any serverless databases (like Neon/Supabase) if they went to sleep.
    const count = await prisma.product.count();
    
    return NextResponse.json(
      { status: "awake", db_status: "connected", product_count: count },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Keep-alive error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
