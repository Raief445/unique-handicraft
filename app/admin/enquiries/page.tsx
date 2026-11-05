import prisma from "@/lib/db";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const statusStyles: Record<
    string,
    { bg: string; color: string; border: string }
  > = {
    NEW: { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
    CONTACTED: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    REQUIREMENT_DISCUSSION: { bg: "#fefce8", color: "#ca8a04", border: "#fef08a" },
    QUOTATION_SENT: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    NEGOTIATION: { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
    CONFIRMED: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
    COMPLETED: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
    CLOSED: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
  };

  const newCount = enquiries.filter((e) => e.status === "NEW").length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>B2B Enquiries</h1>
        <p>
          Managing {enquiries.length} total customer enquiries
          {newCount > 0 ? ` (${newCount} requiring review)` : ""}
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Enquiry Reference</th>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Country</th>
                <th>Products</th>
                <th>Date Received</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "3rem", color: "#888" }}
                  >
                    No enquiries received yet.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => {
                  const badge =
                    statusStyles[enq.status] || {
                      bg: "#f3f4f6",
                      color: "#4b5563",
                      border: "#e5e7eb",
                    };

                  return (
                    <tr key={enq.id}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#1e293b" }}>
                          {enq.enquiryNumber}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#2c2520" }}>
                          {enq.companyName}
                        </div>
                      </td>
                      <td>{enq.customerName}</td>
                      <td>
                        <span style={{ color: "#64748b" }}>{enq.country}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {enq.items.length} item{enq.items.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {enq.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/enquiries/${enq.id}`}
                          className={styles.viewLink}
                        >
                          <span>Manage</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
