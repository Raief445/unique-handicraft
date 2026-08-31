import prisma from "@/lib/db";
import { Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import EnquiryActions from "@/components/admin/EnquiryActions";
import styles from "./enquiry.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminEnquiryDetailPage({ params }: { params: { id: string } }) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      files: true,
    },
  });

  if (!enquiry) return notFound();

  return (
    <div>
      <div className={styles.header}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <Link href="/admin/enquiries" className={styles.backLink}>← Back</Link>
          <h1 className={styles.title}>Enquiry: {enquiry.enquiryNumber}</h1>
        </div>
        <p className={styles.subtitle}>Received on {new Date(enquiry.createdAt).toLocaleString("en-IN")}</p>
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
            
            {enquiry.files.length > 0 && (
              <div className={styles.filesList}>
                <h3>Attachments</h3>
                {enquiry.files.map((file) => (
                  <a key={file.id} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
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
          <EnquiryActions enquiryId={enquiry.id} currentStatus={enquiry.status} />
        </div>
      </div>
    </div>
  );
}
