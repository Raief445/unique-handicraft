import { Prisma } from "@prisma/client";

export type DocumentTypeEnum = "TAX_INVOICE" | "BILL_OF_SUPPLY" | "QUOTATION" | "PROFORMA_INVOICE";

export interface ItemCalculationInput {
  description: string;
  hsnCode?: string | null;
  quantity: number;
  unitPrice: number; // Raw entered price
  priceMode: "EXCLUSIVE" | "INCLUSIVE";
  gstRate: number; // e.g. 18 or 12 or 5 or 0
}

export interface CalculatedItem {
  itemIndex: number;
  description: string;
  hsnCode: string | null;
  quantity: number;
  unitPrice: Prisma.Decimal; // Effective taxable unit price
  taxableAmount: Prisma.Decimal;
  gstRate: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

export interface InvoiceCalculations {
  items: CalculatedItem[];
  subtotal: Prisma.Decimal;
  cgstAmount: Prisma.Decimal;
  sgstAmount: Prisma.Decimal;
  igstAmount: Prisma.Decimal;
  totalTaxAmount: Prisma.Decimal;
  shippingCharges: Prisma.Decimal;
  shippingGstRate: Prisma.Decimal;
  shippingTaxAmount: Prisma.Decimal;
  roundOffAmount: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
}

/**
 * Calculates Indian Financial Year string (April 1 to March 31) in Asia/Kolkata timezone.
 * e.g., November 2026 -> "2026-27", February 2027 -> "2026-27"
 */
export function getIndianFinancialYear(date: Date = new Date()): string {
  const kolkataDateStr = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
  const d = new Date(kolkataDateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  if (month >= 4) {
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    const yearShort = String(year).slice(-2);
    return `${year - 1}-${yearShort}`;
  }
}

/**
 * Maps document type to legal sequence prefix.
 */
export function getDocumentPrefix(type: DocumentTypeEnum): string {
  switch (type) {
    case "TAX_INVOICE":
      return "UTH";
    case "BILL_OF_SUPPLY":
      return "BOS";
    case "QUOTATION":
      return "QUOT";
    case "PROFORMA_INVOICE":
      return "PI";
    default:
      return "UTH";
  }
}

/**
 * Maps document type to user-facing title.
 */
export function getDocumentTitle(type: DocumentTypeEnum): string {
  switch (type) {
    case "TAX_INVOICE":
      return "Tax Invoice";
    case "BILL_OF_SUPPLY":
      return "Bill of Supply";
    case "QUOTATION":
      return "Quotation";
    case "PROFORMA_INVOICE":
      return "Proforma Invoice";
    default:
      return "Tax Invoice";
  }
}

/**
 * Formats a number, string, or Decimal into standard Indian Rupee currency (₹).
 */
export function formatInr(amount: number | string | Prisma.Decimal | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0.00";
  const num = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Round a number to 2 decimal places with banker/paise precision.
 */
function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Server-side calculation engine for invoices.
 * Validates prices, calculates tax amounts (exclusive vs inclusive), handles shipping GST,
 * and splits CGST+SGST vs IGST based on interstate flag.
 */
export function calculateInvoiceTotals(
  rawItems: ItemCalculationInput[],
  isInterState: boolean,
  shippingChargesRaw: number = 0,
  shippingGstRateRaw: number = 0
): InvoiceCalculations {
  if (!rawItems || rawItems.length === 0) {
    throw new Error("Invoice must contain at least one line item.");
  }

  let runningSubtotal = 0;
  let runningItemTax = 0;

  const items: CalculatedItem[] = rawItems.map((item, index) => {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const rawPrice = Math.max(0, Number(item.unitPrice) || 0);
    const gstRate = Math.max(0, Number(item.gstRate) || 0);

    let taxableAmount = 0;
    let taxAmount = 0;
    let totalAmount = 0;
    let effectiveUnitPrice = 0;

    if (item.priceMode === "INCLUSIVE" && gstRate > 0) {
      // Gross price includes GST
      const grossTotal = round2(qty * rawPrice);
      taxableAmount = round2(grossTotal / (1 + gstRate / 100));
      taxAmount = round2(grossTotal - taxableAmount);
      totalAmount = grossTotal;
      effectiveUnitPrice = round2(taxableAmount / qty);
    } else {
      // Exclusive price: GST is added on top
      effectiveUnitPrice = round2(rawPrice);
      taxableAmount = round2(qty * effectiveUnitPrice);
      taxAmount = round2(taxableAmount * (gstRate / 100));
      totalAmount = round2(taxableAmount + taxAmount);
    }

    runningSubtotal += taxableAmount;
    runningItemTax += taxAmount;

    return {
      itemIndex: index,
      description: item.description.trim(),
      hsnCode: item.hsnCode?.trim() || null,
      quantity: qty,
      unitPrice: new Prisma.Decimal(effectiveUnitPrice.toFixed(2)),
      taxableAmount: new Prisma.Decimal(taxableAmount.toFixed(2)),
      gstRate: new Prisma.Decimal(gstRate.toFixed(2)),
      taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
      totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
    };
  });

  // Calculate Shipping / Crating charges and its GST
  const shippingCharges = round2(Math.max(0, Number(shippingChargesRaw) || 0));
  const shippingGstRate = round2(Math.max(0, Number(shippingGstRateRaw) || 0));
  const shippingTaxAmount = round2(shippingCharges * (shippingGstRate / 100));

  const subtotal = round2(runningSubtotal);
  const totalTaxAmount = round2(runningItemTax + shippingTaxAmount);

  // Distribute tax: Intra-state (CGST + SGST) vs Inter-state (IGST)
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = totalTaxAmount;
    cgstAmount = 0;
    sgstAmount = 0;
  } else {
    cgstAmount = round2(totalTaxAmount / 2);
    sgstAmount = round2(totalTaxAmount - cgstAmount); // Balance to ensure exact sum
    igstAmount = 0;
  }

  const rawGrandTotal = round2(subtotal + totalTaxAmount + shippingCharges);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOffAmount = round2(roundedGrandTotal - rawGrandTotal);
  const grandTotal = roundedGrandTotal;

  return {
    items,
    subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
    cgstAmount: new Prisma.Decimal(cgstAmount.toFixed(2)),
    sgstAmount: new Prisma.Decimal(sgstAmount.toFixed(2)),
    igstAmount: new Prisma.Decimal(igstAmount.toFixed(2)),
    totalTaxAmount: new Prisma.Decimal(totalTaxAmount.toFixed(2)),
    shippingCharges: new Prisma.Decimal(shippingCharges.toFixed(2)),
    shippingGstRate: new Prisma.Decimal(shippingGstRate.toFixed(2)),
    shippingTaxAmount: new Prisma.Decimal(shippingTaxAmount.toFixed(2)),
    roundOffAmount: new Prisma.Decimal(roundOffAmount.toFixed(2)),
    grandTotal: new Prisma.Decimal(grandTotal.toFixed(2)),
  };
}

/**
 * Concurrency-safe atomic number allocation inside a PostgreSQL transaction.
 */
export async function getNextInvoiceNumber(
  tx: Prisma.TransactionClient,
  docType: DocumentTypeEnum,
  date: Date = new Date()
): Promise<{ prefix: string; financialYear: string; sequenceNumber: number; invoiceNumber: string }> {
  const prefix = getDocumentPrefix(docType);
  const financialYear = getIndianFinancialYear(date);

  const seqResult = await tx.$queryRawUnsafe<Array<{ lastNumber: number }>>(
    `
    INSERT INTO "InvoiceSequence" ("prefix", "financialYear", "lastNumber", "updatedAt")
    VALUES ($1, $2, 1, NOW())
    ON CONFLICT ("prefix", "financialYear")
    DO UPDATE SET "lastNumber" = "InvoiceSequence"."lastNumber" + 1, "updatedAt" = NOW()
    RETURNING "lastNumber";
    `,
    prefix,
    financialYear
  );

  const sequenceNumber = seqResult[0].lastNumber;
  const formattedSerial = String(sequenceNumber).padStart(4, "0");
  const invoiceNumber = `${prefix}/${financialYear}/${formattedSerial}`;

  return { prefix, financialYear, sequenceNumber, invoiceNumber };
}

/**
 * Verified base business and bank coordinates for Unique Timber & Handicraft.
 * Used for pre-filling invoice drafts while keeping them customizable.
 */
export const DEFAULT_BUSINESS_DETAILS = {
  businessName: "Unique Timber & Handicraft",
  businessAddress: "G-128, RIICO Industrial Area, Phase II, Basni, Jodhpur, Rajasthan 342005",
  businessGstin: "08AABCU1234F1Z5",
  businessPan: "AABCU1234F",
  businessPhone: "+91 94141 33434",
  businessEmail: "uniquetimberhandicraftjodhpur@gmail.com",
};

export const DEFAULT_BANK_DETAILS = {
  bankName: "State Bank of India",
  bankAccountName: "Unique Timber and Handicraft",
  bankAccountNumber: "38920194829",
  bankIfsc: "SBIN0031172",
  bankBranch: "Basni Industrial Area, Jodhpur",
};

