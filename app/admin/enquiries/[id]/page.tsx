import prisma from "@/lib/db";
import { Paperclip, Receipt, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import EnquiryActions from "@/components/admin/EnquiryActions";
import styles from "./enquiry.module.css";
import Link from "next/link";
import { formatInr } from "@/lib/billing";

export const dynamic = "force-dynamic";

export default async function AdminEnquiryDetailPage({ params }: { params: { id: string } }) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      files: true,
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!enquiry) return notFound();

  return (
    <div>
      <div className={styles.header} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <Link href="/admin/enquiries" className={styles.backLink}>← Back</Link>
            <h1 className={styles.title}>Enquiry: {enquiry.enquiryNumber}</h1>
          </div>
          <p className={styles.subtitle}>Received on {new Date(enquiry.createdAt).toLocaleString("en-IN")}</p>
        </div>
        <div>
          <Link
            href={`/admin/invoices/new?enquiryId=${enquiry.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#1A1A1A",
              color: "#FFFFFF",
              padding: "0.6rem 1.1rem",
              borderRadius: "4px",
              fontWeight: 500,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <Receipt size={16} />
            <span>Create B2C Invoice</span>
          </Link>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section className={styles.section}>
            <h2>Customer Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>Company Name</span>
                <strong>{enquiry.companyName}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Contact Person</span>
                <strong>{enquiry.customerName}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Email</span>
                <strong><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></strong>
              </div>
              <div className={styles.infoItem}>
                <span>Phone</span>
                <strong><a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a></strong>
              </div>
              <div className={styles.infoItem}>
                <span>Location</span>
                <strong>{enquiry.location}, {enquiry.country}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Designation</span>
                <strong>{enquiry.designation || "—"}</strong>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Requirements</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>Expected Quantity</span>
                <strong>{enquiry.expectedQuantity || "Not specified"}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Delivery Date</span>
                <strong>{enquiry.deliveryDate || "Not specified"}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Customization Required</span>
                <strong>{enquiry.customizationRequired ? "Yes" : "No"}</strong>
              </div>
            </div>
            
            {enquiry.message && (
              <div className={styles.messageBox}>
                <h3>Message / Additional Requirements</h3>
                <p>{enquiry.message}</p>
              </div>
            )}

            {enquiry.adminNotes && (
              <div
                className={styles.messageBox}
                style={{
                  borderLeft: "4px solid #C1A27A",
                  backgroundColor: "#faf8f5",
                }}
              >
                <h3>Internal Admin Notes &amp; History</h3>
                <p style={{ whiteSpace: "pre-line", color: "#3A2F28" }}>{enquiry.adminNotes}</p>
              </div>
            )}
            
            {enquiry.files.length > 0 && (
              <div className={styles.filesList}>
                <h3>Attachments</h3>
                {enquiry.files.map((file) => (
                  <a key={file.id} href={`/api/admin/enquiries/file/${file.id}`} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Paperclip size={16} /> {file.fileName}</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>Products Enquired</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Code</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {enquiry.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productNameSnapshot}</td>
                    <td style={{ fontFamily: "monospace" }}>{item.productCodeSnapshot}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className={styles.sideCol}>
          {enquiry.invoices && enquiry.invoices.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e0d8",
                borderRadius: "8px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Receipt size={16} />
                <span>Issued Invoices ({enquiry.invoices.length})</span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {enquiry.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: "0.75rem",
                      background: "#faf8f5",
                      border: "1px solid #ede8e1",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <Link
                        href={`/admin/invoices/${inv.id}`}
                        style={{ fontWeight: 600, color: "#1a1a1a", textDecoration: "none" }}
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: inv.paymentStatus === "PAID" ? "#E8F5E9" : "#FFF3E0",
                          color: inv.paymentStatus === "PAID" ? "#2E7D32" : "#E65100",
                        }}
                      >
                        {inv.paymentStatus}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                      <span>{new Date(inv.issueDate).toLocaleDateString("en-IN")}</span>
                      <strong style={{ color: "#1a1a1a" }}>{formatInr(inv.grandTotal)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <EnquiryActions
            enquiryId={enquiry.id}
            currentStatus={enquiry.status}
            customerEmail={enquiry.email}
            customerName={enquiry.customerName}
          />
        </div>
      </div>
    </div>
  );
}
