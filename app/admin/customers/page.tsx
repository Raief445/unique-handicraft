import prisma from "@/lib/db";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customersData = await prisma.enquiry.findMany({
    select: {
      email: true,
      customerName: true,
      companyName: true,
      phone: true,
      location: true,
      country: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by email to get unique customers (using the first enquiry as the creation date)
  const uniqueCustomersMap = new Map();
  customersData.forEach((c) => {
    if (!uniqueCustomersMap.has(c.email)) {
      uniqueCustomersMap.set(c.email, {
        ...c,
        enquiryCount: 1,
      });
    } else {
      const existing = uniqueCustomersMap.get(c.email);
      existing.enquiryCount += 1;
    }
  });

  const customers = Array.from(uniqueCustomersMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Customers</h1>
        <p>List of unique customers that have sent enquiries.</p>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Total Enquiries</th>
                <th>First Contact</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.companyName}</strong></td>
                    <td>{c.customerName}</td>
                    <td><a href={`mailto:${c.email}`} style={{ color: "var(--color-secondary)" }}>{c.email}</a></td>
                    <td>{c.phone}</td>
                    <td>{c.location}, {c.country}</td>
                    <td>{c.enquiryCount}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
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
