import prisma from "@/lib/db";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { PlusCircle, Edit2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Categories</h1>
            <p>Manage product collections and groupings</p>
          </div>
          <Link href="/admin/categories/new" className={styles.quickBtnPrimary}>
            <PlusCircle size={16} />
            <span>Add Category</span>
          </Link>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Category Preview</th>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Products Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const isActive = category.status === "ACTIVE";

                  return (
                    <tr key={category.id}>
                      <td style={{ color: "#94a3b8", fontWeight: 600 }}>
                        #{category.displayOrder}
                      </td>
                      <td>
                        <div
                          style={{
                            width: 60,
                            height: 44,
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#faf8f5",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={
                              category.image ||
                              "https://placehold.co/60x44/F0EEE9/3A2F28?text=Cat"
                            }
                            alt={category.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "#1e293b", fontSize: "0.92rem" }}>
                          {category.name}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.82rem",
                            color: "#475569",
                          }}
                        >
                          /{category.slug}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {category._count.products} piece{category._count.products !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: isActive ? "#ecfdf5" : "#f1f5f9",
                            color: isActive ? "#059669" : "#64748b",
                            border: `1px solid ${isActive ? "#a7f3d0" : "#e2e8f0"}`,
                          }}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className={styles.viewLink}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
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
