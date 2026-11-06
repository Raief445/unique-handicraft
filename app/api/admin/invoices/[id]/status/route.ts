import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { InvoicePaymentStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { paymentStatus } = body;

    if (!paymentStatus || (paymentStatus !== "PAID" && paymentStatus !== "UNPAID")) {
      return NextResponse.json(
        { error: "Invalid paymentStatus. Allowed values: 'PAID' or 'UNPAID'." },
        { status: 400 }
      );
    }

    const existing = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true, invoiceNumber: true, paymentStatus: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus as InvoicePaymentStatus,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      paymentStatus: updated.paymentStatus,
      paidAt: updated.paidAt,
    });
  } catch (error: any) {
    console.error("Error updating invoice payment status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment status." },
      { status: 500 }
    );
  }
}

