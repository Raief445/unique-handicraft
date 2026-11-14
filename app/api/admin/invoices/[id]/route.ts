import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true, invoiceNumber: true, documentType: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Strict safety protection: Only TEST_INVOICE documents can be deleted
    if (existing.documentType !== "TEST_INVOICE") {
      return NextResponse.json(
        {
          error:
            "Statutory Protection: Official tax invoices, quotations, and bills of supply cannot be deleted. Only test invoices can be removed.",
        },
        { status: 403 }
      );
    }

    // Delete invoice (associated InvoiceItems cascade automatically)
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Test invoice ${existing.invoiceNumber} deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Error deleting test invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete test invoice." },
      { status: 500 }
    );
  }
}

