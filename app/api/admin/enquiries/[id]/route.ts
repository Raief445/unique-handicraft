import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.update({
      where: { id: params.id },
      data: { status: status as any },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update enquiry status" }, { status: 500 });
  }
}
