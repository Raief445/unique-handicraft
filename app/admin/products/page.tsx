import prisma from "@/lib/db";
import { Star } from "lucide-react";
import Link from "next/link";
import styles from "../dashboard.module.css";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      status: {
        not: "ARCHIVED",
      },
    },
    include: {
      category: true,
      images: { where: { imageType: "MAIN" }, take: 1 },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Products</h1>
            <p>{products.length} products in catalogue</p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">+ Add New Product</Link>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    No products yet. <Link href="/admin/products/new">Add your first product</Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.images[0]?.imageUrl || "https://placehold.co/80x60/F0EEE9/3A2F28?text=No+Image"}
                        alt={product.name}
                        style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                      />
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td style={{ fontFamily: "monospace" }}>{product.productCode}</td>
                    <td>{product.category.name}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background:
                            product.status === "PUBLISHED" ? "#38A169" :
                            product.status === "DRAFT" ? "#D69E2E" : "#A0AEC0",
                        }}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td>{product.featured ? <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Star size={16} /> Yes</span> : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href={`/admin/products/${product.id}`} className={styles.viewLink}>Edit</Link>
                        <Link href={`/products/${product.id}`} target="_blank" className={styles.viewLink} style={{ color: "#888" }}>View</Link>
                        <DeleteProductButton id={product.id} />
                      </div>
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
