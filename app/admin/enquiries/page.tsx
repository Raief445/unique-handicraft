import prisma from "@/lib/db";
import Link from "next/link";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const statusColors: Record<string, string> = {
    NEW: "#E53E3E",
    CONTACTED: "#DD6B20",
    REQUIREMENT_DISCUSSION: "#D69E2E",
    QUOTATION_SENT: "#38A169",
    NEGOTIATION: "#3182CE",
    CONFIRMED: "#805AD5",
    COMPLETED: "#2D3748",
    CLOSED: "#A0AEC0",
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Enquiries</h1>
        <p>Manage customer B2B enquiries</p>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Enquiry #</th>
                <th>Company</th>
                <th>Customer</th>
                <th>Country</th>
                <th>Items</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    No enquiries received yet.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td><strong>{enq.enquiryNumber}</strong></td>
                    <td>{enq.companyName}</td>
                    <td>{enq.customerName}</td>
                    <td>{enq.country}</td>
                    <td>{enq.items.length}</td>
                    <td>{new Date(enq.createdAt).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: statusColors[enq.status] || "#888" }}
                      >
                        {enq.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/enquiries/${enq.id}`} className={styles.viewLink}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
