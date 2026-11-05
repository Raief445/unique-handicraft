import prisma from "@/lib/db";
import { Star, PlusCircle, ExternalLink, Edit2 } from "lucide-react";
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
            <h1>Product Catalogue</h1>
            <p>{products.length} artisanal furniture pieces in collection</p>
          </div>
          <Link href="/admin/products/new" className={styles.quickBtnPrimary}>
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Piece Preview</th>
                <th>Product Name</th>
                <th>Item Code</th>
                <th>Category</th>
                <th>Catalogue Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
                    No products yet.{" "}
                    <Link href="/admin/products/new" style={{ color: "#c1a27a", fontWeight: 600 }}>
                      Add your first piece
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isPublished = product.status === "PUBLISHED";
                  const isDraft = product.status === "DRAFT";

                  return (
                    <tr key={product.id}>
                      <td>
                        <div
                          style={{
                            width: 72,
                            height: 56,
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
                              product.images[0]?.imageUrl ||
                              "https://placehold.co/80x60/F0EEE9/3A2F28?text=No+Image"
                            }
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "#1e293b", fontSize: "0.92rem" }}>
                          {product.name}
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
                          {product.productCode}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#64748b" }}>{product.category.name}</span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: isPublished
                              ? "#ecfdf5"
                              : isDraft
                              ? "#fffbeb"
                              : "#f1f5f9",
                            color: isPublished
                              ? "#059669"
                              : isDraft
                              ? "#d97706"
                              : "#475569",
                            border: `1px solid ${
                              isPublished
                                ? "#a7f3d0"
                                : isDraft
                                ? "#fde68a"
                                : "#e2e8f0"
                            }`,
                          }}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td>
                        {product.featured ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#b45309",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                            }}
                          >
                            <Star size={15} fill="#f59e0b" color="#f59e0b" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className={styles.viewLink}
                            title="Edit product"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </Link>
                          <a
                            href={`/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewLink}
                            style={{
                              background: "#ffffff",
                              borderColor: "#e2e8f0",
                              color: "#64748b",
                            }}
                            title="Preview on storefront"
                          >
                            <ExternalLink size={12} />
                          </a>
                          <DeleteProductButton id={product.id} />
                        </div>
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
