import prisma from "@/lib/db";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import InvoiceListTable, { SerializedInvoice } from "@/components/admin/InvoiceListTable";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      enquiry: {
        select: { enquiryNumber: true },
      },
    },
  });

  const serialized: SerializedInvoice[] = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    documentType: inv.documentType as any,
    financialYear: inv.financialYear,
    customerName: inv.customerName,
    customerEmail: inv.customerEmail,
    customerPhone: inv.customerPhone,
    placeOfSupply: inv.placeOfSupply,
    issueDate: inv.issueDate.toISOString(),
    grandTotal: Number(inv.grandTotal),
    paymentStatus: inv.paymentStatus as any,
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    enquiryId: inv.enquiryId,
    enquiryNumber: inv.enquiry?.enquiryNumber || null,
  }));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1A1A1A", marginBottom: "0.25rem" }}>
            B2C Invoices & Quotations
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Create and track customer retail bills, quotations and direct bank wire payments.
          </p>
        </div>

        <Link
          href="/admin/invoices/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "#1A1A1A",
            color: "#FFFFFF",
            padding: "0.65rem 1.25rem",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          <Plus size={16} />
          <span>Create New Bill</span>
        </Link>
      </div>

      <InvoiceListTable initialInvoices={serialized} />
    </div>
  );
}

