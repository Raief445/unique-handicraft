import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getIndianFinancialYear } from "@/lib/billing";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Delete all test invoices and their items
    const deleteResult = await prisma.invoice.deleteMany({
      where: {
        documentType: "TEST_INVOICE",
      },
    });

    // Reset the test sequence to 0
    const currentFY = getIndianFinancialYear();
    await prisma.invoiceSequence.upsert({
      where: {
        prefix_financialYear: {
          prefix: "TEST",
          financialYear: currentFY,
        },
      },
      update: { lastNumber: 0 },
      create: {
        prefix: "TEST",
        financialYear: currentFY,
        lastNumber: 0,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Cleared ${deleteResult.count} test invoice(s) and reset test sequence counter to 0.`,
    });
  } catch (error: any) {
    console.error("Error clearing test invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear test invoices." },
      { status: 500 }
    );
  }
}

