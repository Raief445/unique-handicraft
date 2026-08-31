import prisma from "@/lib/db";
import Link from "next/link";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Categories</h1>
            <p>Manage product categories</p>
          </div>
          <Link href="/admin/categories/new" className="btn-primary">+ Add Category</Link>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.displayOrder}</td>
                    <td><strong>{category.name}</strong></td>
                    <td>{category.slug}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: category.status === "ACTIVE" ? "#38A169" : "#A0AEC0",
                        }}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/categories/${category.id}`} className={styles.viewLink}>
                        Edit
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
