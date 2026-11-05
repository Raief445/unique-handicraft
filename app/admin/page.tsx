import prisma from "@/lib/db";
import Link from "next/link";
import styles from "./dashboard.module.css";
import {
  Armchair,
  CheckCircle2,
  FileEdit,
  ClipboardList,
  Bell,
  PlusCircle,
  ArrowRight,
  Folders,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    totalEnquiries,
    newEnquiries,
    recentEnquiries,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
  ]);

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

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Executive Dashboard</h1>
        <p>Overview of catalogue products, B2B customer enquiries, and operations</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Products</span>
            <div className={styles.statIconBox} style={{ background: "#fdf8f4", color: "#8c6734" }}>
              <Armchair size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{totalProducts}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Published</span>
            <div className={styles.statIconBox} style={{ background: "#ecfdf5", color: "#059669" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: "#059669" }}>
            {publishedProducts}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Drafts</span>
            <div className={styles.statIconBox} style={{ background: "#fffbeb", color: "#d97706" }}>
              <FileEdit size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: "#d97706" }}>
            {draftProducts}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Enquiries</span>
            <div className={styles.statIconBox} style={{ background: "#eff6ff", color: "#2563eb" }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{totalEnquiries}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>New Enquiries</span>
            <div className={styles.statIconBox} style={{ background: "#fff1f2", color: "#e11d48" }}>
              <Bell size={18} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: "#e11d48" }}>
            {newEnquiries}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className={styles.quickActions}>
        <Link href="/admin/products/new" className={styles.quickBtnPrimary}>
          <PlusCircle size={16} />
          <span>Add New Product</span>
        </Link>
        <Link href="/admin/categories/new" className={styles.quickBtnSecondary}>
          <Folders size={16} />
          <span>Add Category</span>
        </Link>
        <Link href="/admin/enquiries" className={styles.quickBtnSecondary}>
          <ClipboardList size={16} />
          <span>View All Enquiries</span>
        </Link>
      </div>

      {/* Recent Enquiries Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 style={{ border: "none", background: "transparent", padding: 0 }}>
            Recent Customer Enquiries
          </h2>
          <Link href="/admin/enquiries" className={styles.viewLink}>
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Enquiry Ref</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Items</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", color: "#888", padding: "2.5rem" }}
                  >
                    No enquiries received yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => {
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
