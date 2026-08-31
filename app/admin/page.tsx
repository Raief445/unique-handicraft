import prisma from "@/lib/db";
import Link from "next/link";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalProducts, publishedProducts, draftProducts, totalEnquiries, newEnquiries, recentEnquiries] =
    await Promise.all([
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
        <h1>Dashboard</h1>
        <p>Welcome to the Unique Timber & Handicraft Admin Panel</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalProducts}</div>
          <div className={styles.statLabel}>Total Products</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#38A169" }}>{publishedProducts}</div>
          <div className={styles.statLabel}>Published</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#D69E2E" }}>{draftProducts}</div>
          <div className={styles.statLabel}>Draft</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalEnquiries}</div>
          <div className={styles.statLabel}>Total Enquiries</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "#E53E3E" }}>{newEnquiries}</div>
          <div className={styles.statLabel}>New Enquiries</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/admin/products/new" className="btn-primary">+ Add New Product</Link>
        <Link href="/admin/categories/new" className="btn-secondary">+ Add Category</Link>
        <Link href="/admin/enquiries" className="btn-secondary">View All Enquiries</Link>
      </div>

      {/* Recent Enquiries */}
      <div className={styles.section}>
        <h2>Recent Enquiries</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Enquiry #</th>
                <th>Company</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: "2rem" }}>
                    No enquiries yet
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td><strong>{enq.enquiryNumber}</strong></td>
                    <td>{enq.companyName}</td>
                    <td>{enq.customerName}</td>
                    <td>{enq.items.length} item{enq.items.length !== 1 ? "s" : ""}</td>
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
                        View
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
