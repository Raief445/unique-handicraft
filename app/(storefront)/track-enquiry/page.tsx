import prisma from "@/lib/db";
import Link from "next/link";
import styles from "./track.module.css";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackEnquiryPage({
  searchParams,
}: {
  searchParams: { enquiryNumber?: string; email?: string };
}) {
  const { enquiryNumber, email } = searchParams;

  let enquiry = null;
  let error = null;

  if (enquiryNumber && email) {
    try {
      enquiry = await prisma.enquiry.findFirst({
        where: {
          enquiryNumber: enquiryNumber.trim().toUpperCase(),
          email: { equals: email.trim(), mode: "insensitive" },
        },
        include: {
          items: true,
        },
      });

      if (!enquiry) {
        error = "No enquiry found matching this number and email address.";
      }
    } catch (err) {
      error = "An error occurred while tracking your enquiry. Please try again.";
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Track Your Enquiry</h1>
          <p>Enter your enquiry number and email address to check the current status.</p>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.errorBox}>{error}</div>}

          {!enquiry ? (
            <form action="/track-enquiry" method="GET" className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="enquiryNumber">Enquiry Number</label>
                <input
                  type="text"
                  id="enquiryNumber"
                  name="enquiryNumber"
                  placeholder="e.g. ENQ-XXXX-100"
                  defaultValue={enquiryNumber || ""}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="The email used in the enquiry"
                  defaultValue={email || ""}
                  className={styles.input}
                  required
                />
              </div>

              <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
                <Search size={18} style={{ marginRight: '8px' }} />
                Track Status
              </button>
            </form>
          ) : (
            <div className={styles.resultView}>
              <div className={styles.resultHeader}>
                <div>
                  <h2>{enquiry.enquiryNumber}</h2>
                  <span className={styles.date}>
                    Submitted on: {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className={`${styles.statusBadge} ${styles[`status${enquiry.status}`]}`}>
                  {formatStatus(enquiry.status)}
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.section}>
                  <h3>Customer Details</h3>
                  <div className={styles.infoItem}>
                    <strong>Name</strong>
                    <span>{enquiry.customerName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Company</strong>
                    <span>{enquiry.companyName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Email</strong>
                    <span>{enquiry.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Location</strong>
                    <span>{enquiry.location}, {enquiry.country}</span>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Requirements</h3>
                  {enquiry.expectedQuantity && (
                    <div className={styles.infoItem}>
                      <strong>Expected Quantity</strong>
                      <span>{enquiry.expectedQuantity} units</span>
                    </div>
                  )}
                  {enquiry.deliveryDate && (
                    <div className={styles.infoItem}>
                      <strong>Delivery Date</strong>
                      <span>{enquiry.deliveryDate}</span>
                    </div>
                  )}
                  <div className={styles.infoItem}>
                    <strong>Customization</strong>
                    <span>{enquiry.customizationRequired ? "Requested" : "None"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Message</strong>
                    <span>{enquiry.message || "No additional message provided."}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section} style={{ marginTop: '2rem' }}>
                <h3>Products Enquired ({enquiry.items.length})</h3>
                <ul className={styles.itemList}>
                  {enquiry.items.map((item: any) => (
                    <li key={item.id} className={styles.item}>
                      <div>
                        <span className={styles.itemName}>{item.productNameSnapshot}</span>
                        <span className={styles.itemCode}>Code: {item.productCodeSnapshot}</span>
                      </div>
                      <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.actionArea}>
                <Link href="/track-enquiry" className="btn-secondary">
                  Track Another Enquiry
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
