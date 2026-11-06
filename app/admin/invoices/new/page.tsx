import prisma from "@/lib/db";
import InvoiceCreateForm from "@/components/admin/InvoiceCreateForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: { enquiryId?: string };
}) {
  let initialEnquiry = null;

  if (searchParams?.enquiryId) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: searchParams.enquiryId },
      include: { items: true },
    });

    if (enquiry) {
      initialEnquiry = {
        enquiryId: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber,
        customerName: enquiry.customerName,
        email: enquiry.email,
        phone: enquiry.phone,
        location: enquiry.location,
        items: enquiry.items.map((it) => ({
          productNameSnapshot: it.productNameSnapshot,
          productCodeSnapshot: it.productCodeSnapshot,
          quantity: it.quantity,
        })),
      };
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1A1A1A", marginBottom: "0.25rem" }}>
          Create New B2C Bill / Invoice
        </h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Generate a legal Tax Invoice, Bill of Supply, Quotation, or Proforma Invoice for retail customers.
        </p>
      </div>

      <InvoiceCreateForm initialEnquiry={initialEnquiry} />
    </div>
  );
}

