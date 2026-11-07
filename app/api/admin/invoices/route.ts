import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  calculateInvoiceTotals,
  getNextInvoiceNumber,
  DocumentTypeEnum,
  ItemCalculationInput,
} from "@/lib/billing";
import { DocumentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    const {
      documentType = "TAX_INVOICE",
      enquiryId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerGstin,
      placeOfSupply,
      isInterState = false,
      businessName,
      businessAddress,
      businessGstin,
      businessPan,
      businessPhone,
      businessEmail,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankIfsc,
      bankBranch,
      items: rawItems,
      shippingCharges = 0,
      shippingGstRate = 0,
      dueDate,
      notes,
    } = body;

    // 1. Mandatory Validations
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Customer name, email, and phone number are required." },
        { status: 400 }
      );
    }

    if (!businessName || !businessAddress) {
      return NextResponse.json(
        { error: "Verified business name and address are required." },
        { status: 400 }
      );
    }

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "Invoice must contain at least one product line item." },
        { status: 400 }
      );
    }

    // 2. Perform Server-Side Calculation (Never trust frontend totals)
    const calculationItems: ItemCalculationInput[] = rawItems.map((item: any) => ({
      description: String(item.description || "").trim(),
      hsnCode: item.hsnCode ? String(item.hsnCode).trim() : null,
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0),
      priceMode: item.priceMode === "INCLUSIVE" ? "INCLUSIVE" : "EXCLUSIVE",
      gstRate: Math.max(0, parseFloat(item.gstRate) || 0),
    }));

    for (const item of calculationItems) {
      if (!item.description) {
        return NextResponse.json({ error: "Every line item must have a description/title." }, { status: 400 });
      }
    }

    const calculated = calculateInvoiceTotals(
      calculationItems,
      Boolean(isInterState),
      parseFloat(shippingCharges) || 0,
      parseFloat(shippingGstRate) || 0
    );

    // 2b. Rule 46 Proviso Validation: Unregistered recipient with taxable supply value >= ₹50,000
    const isUnregistered = !customerGstin || !customerGstin.trim();
    const isOverFiftyThousand = Number(calculated.subtotal) >= 50000;

    if (isUnregistered && isOverFiftyThousand) {
      if (!customerName || customerName.trim().length < 2) {
        return NextResponse.json(
          { error: "Under GST Rule 46 proviso, supplies of ₹50,000 or more to an unregistered recipient require the recipient's full legal name." },
          { status: 400 }
        );
      }
      if (!customerAddress || customerAddress.trim().length < 5) {
        return NextResponse.json(
          { error: "Under GST Rule 46 proviso, supplies of ₹50,000 or more to an unregistered recipient require the complete billing address and delivery address." },
          { status: 400 }
        );
      }
      if (!placeOfSupply || !placeOfSupply.trim()) {
        return NextResponse.json(
          { error: "Under GST Rule 46 proviso, supplies of ₹50,000 or more to an unregistered recipient require the destination State Name and 2-digit State Code." },
          { status: 400 }
        );
      }
    }

    // 3. Concurrency-Safe Transaction: Sequence Allocation + Persistence
    const invoice = await prisma.$transaction(async (tx) => {
      const { financialYear, sequenceNumber, invoiceNumber } = await getNextInvoiceNumber(
        tx,
        documentType as DocumentTypeEnum
      );

      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          documentType: documentType as DocumentType,
          financialYear,
          sequenceNumber,
          enquiryId: enquiryId || null,

          // Customer snapshot
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress ? customerAddress.trim() : null,
          customerGstin: customerGstin ? customerGstin.trim().toUpperCase() : null,

          // Tax & Place of Supply
          placeOfSupply: placeOfSupply ? placeOfSupply.trim() : "Rajasthan (08)",
          isInterState: Boolean(isInterState),

          // Business snapshot
          businessName: businessName.trim(),
          businessAddress: businessAddress.trim(),
          businessGstin: businessGstin ? businessGstin.trim().toUpperCase() : null,
          businessPan: businessPan ? businessPan.trim().toUpperCase() : null,
          businessPhone: businessPhone.trim(),
          businessEmail: businessEmail.trim().toLowerCase(),

          // Bank transfer snapshot (Optional)
          bankName: bankName && bankName.trim() ? bankName.trim() : null,
          bankAccountName: bankAccountName && bankAccountName.trim() ? bankAccountName.trim() : null,
          bankAccountNumber: bankAccountNumber && bankAccountNumber.trim() ? bankAccountNumber.trim() : null,
          bankIfsc: bankIfsc && bankIfsc.trim() ? bankIfsc.trim().toUpperCase() : null,
          bankBranch: bankBranch && bankBranch.trim() ? bankBranch.trim() : null,

          // Dates
          dueDate: dueDate ? new Date(dueDate) : null,

          // Calculated Financial Totals
          subtotal: calculated.subtotal,
          cgstAmount: calculated.cgstAmount,
          sgstAmount: calculated.sgstAmount,
          igstAmount: calculated.igstAmount,
          totalTaxAmount: calculated.totalTaxAmount,
          shippingCharges: calculated.shippingCharges,
          shippingGstRate: calculated.shippingGstRate,
          shippingTaxAmount: calculated.shippingTaxAmount,
          roundOffAmount: calculated.roundOffAmount,
          grandTotal: calculated.grandTotal,

          notes: notes ? notes.trim() : null,

          // Line items
          items: {
            create: calculated.items.map((it) => ({
              itemIndex: it.itemIndex,
              description: it.description,
              hsnCode: it.hsnCode,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              taxableAmount: it.taxableAmount,
              gstRate: it.gstRate,
              taxAmount: it.taxAmount,
              totalAmount: it.totalAmount,
            })),
          },
        },
      });

      return createdInvoice;
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch (error: any) {
    console.error("Error creating B2C invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice. Please try again." },
      { status: 500 }
    );
  }
}

