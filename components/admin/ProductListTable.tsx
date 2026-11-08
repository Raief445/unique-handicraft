"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Edit2, ExternalLink, ArrowUp, ArrowDown, Check, RefreshCw, Search } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import styles from "@/app/admin/dashboard.module.css";

export type AdminProductItem = {
  id: string;
  productCode: string;
  name: string;
  status: string;
  featured: boolean;
  featuredOrder: number;
  displayOrder: number;
  createdAt: string | Date;
  category: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    imageUrl: string;
    imageType: string | null;
  }[];
};

export default function ProductListTable({
  initialProducts,
}: {
  initialProducts: AdminProductItem[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempOrder, setTempOrder] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleMove = async (productId: string, direction: "UP" | "DOWN") => {
    const currentIndex = products.findIndex((p) => p.id === productId);
    if (currentIndex === -1) return;
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    // Optimistic local swap
    const nextList = [...products];
    const temp = nextList[currentIndex];
    nextList[currentIndex] = nextList[targetIndex];
    nextList[targetIndex] = temp;

    // Update display orders locally
    const resequenced = nextList.map((p, idx) => ({
      ...p,
      displayOrder: idx + 1,
    }));
    setProducts(resequenced);
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESEQUENCE",
          orderedIds: resequenced.map((p) => p.id),
        }),
      });

      if (res.ok) {
        showNotification("Display order updated & live on storefront!");
        router.refresh();
      } else {
        showNotification("Failed to save reorder.");
        setProducts(initialProducts);
      }
    } catch {
      showNotification("Network error while reordering.");
      setProducts(initialProducts);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustomOrder = async (productId: string) => {
    const num = Number(tempOrder);
    if (isNaN(num)) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_ORDER",
          productId,
          newOrder: num,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev
            .map((p) => (p.id === productId ? { ...p, displayOrder: num } : p))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
        setEditingId(null);
        showNotification("Position saved!");
        router.refresh();
      } else {
        showNotification("Failed to update position.");
      }
    } catch {
      showNotification("Network error while updating position.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSequenceAll = async () => {
    if (!confirm("This will assign clean sequential display orders (1, 2, 3...) to all products based on their current positions. Proceed?")) {
      return;
    }

    setIsSaving(true);
    const orderedIds = products.map((p) => p.id);

    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESEQUENCE",
          orderedIds,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p, idx) => ({ ...p, displayOrder: idx + 1 }))
        );
        showNotification("All products sequenced 1, 2, 3... successfully!");
        router.refresh();
      } else {
        showNotification("Failed to auto-sequence.");
      }
    } catch {
      showNotification("Network error during auto-sequence.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.productCode.toLowerCase().includes(term) ||
      p.category.name.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Informative Banner & Controls */}
      <div
        style={{
          background: "#faf8f5",
          border: "1px solid #e2d9cd",
          borderRadius: 8,
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", color: "#3a2f28" }}>
            Catalogue Display Order
          </h4>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b5d52" }}>
            Controls the exact sequence pieces appear on the <strong>All Products</strong> storefront page (Position #1 displays first).
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={handleAutoSequenceAll}
            disabled={isSaving}
            className="btn-secondary"
            style={{
              padding: "0.45rem 0.85rem",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
            title="Normalize display orders to clean 1, 2, 3..."
          >
            <RefreshCw size={13} className={isSaving ? "spin" : ""} />
            <span>Auto-Sequence (1, 2, 3...)</span>
          </button>

          {statusMessage && (
            <span
              style={{
                fontSize: "0.82rem",
                color: statusMessage.includes("Failed") ? "#dc2626" : "#059669",
                background: statusMessage.includes("Failed") ? "#fef2f2" : "#ecfdf5",
                padding: "4px 8px",
                borderRadius: 4,
                fontWeight: 500,
              }}
            >
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", maxWidth: 300, width: "100%" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Filter catalogue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.2rem",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          Showing <strong>{filteredProducts.length}</strong> of {products.length} pieces
        </p>
      </div>

      {/* Main Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>Display Order</th>
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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
                  No matching pieces found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, idx) => {
                const isPublished = product.status === "PUBLISHED";
                const isDraft = product.status === "DRAFT";
                const isFirst = idx === 0;
                const isLast = idx === filteredProducts.length - 1;

                const displayImage =
                  product.images.find((i) => i.imageType === "MAIN")?.imageUrl ||
                  product.images[0]?.imageUrl ||
                  "https://placehold.co/80x60/F0EEE9/3A2F28?text=No+Image";

                return (
                  <tr key={product.id}>
                    {/* Order Controls */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {editingId === product.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              value={tempOrder}
                              onChange={(e) => setTempOrder(Number(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveCustomOrder(product.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              style={{
                                width: 50,
                                padding: "3px 4px",
                                fontSize: "0.85rem",
                                borderRadius: 4,
                                border: "1.5px solid #c1a27a",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCustomOrder(product.id)}
                              disabled={isSaving}
                              style={{
                                background: "#059669",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                              title="Save order"
                            >
                              <Check size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(product.id);
                              setTempOrder(product.displayOrder);
                            }}
                            title="Click to edit position number"
                            style={{
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: 4,
                              padding: "2px 8px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#1e293b",
                              cursor: "pointer",
                              minWidth: 36,
                              textAlign: "center",
                            }}
                          >
                            #{product.displayOrder}
                          </button>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button
                            type="button"
                            onClick={() => handleMove(product.id, "UP")}
                            disabled={isFirst || isSaving}
                            style={{
                              background: isFirst ? "#f8fafc" : "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: 3,
                              padding: "1px 4px",
                              cursor: isFirst ? "default" : "pointer",
                              color: isFirst ? "#cbd5e1" : "#475569",
                              lineHeight: 1,
                            }}
                            title="Move piece up in catalogue"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(product.id, "DOWN")}
                            disabled={isLast || isSaving}
                            style={{
                              background: isLast ? "#f8fafc" : "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: 3,
                              padding: "1px 4px",
                              cursor: isLast ? "default" : "pointer",
                              color: isLast ? "#cbd5e1" : "#475569",
                              lineHeight: 1,
                            }}
                            title="Move piece down in catalogue"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Image */}
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
                          src={displayImage}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </td>

                    {/* Product Name */}
                    <td>
                      <Link
                        href={`/admin/products/${product.id}`}
                        style={{ color: "#1e293b", textDecoration: "none" }}
                      >
                        <strong style={{ fontSize: "0.92rem", display: "block" }}>
                          {product.name}
                        </strong>
                      </Link>
                    </td>

                    {/* Product Code */}
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

                    {/* Category */}
                    <td>
                      <span style={{ color: "#64748b" }}>{product.category.name}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: isPublished ? "#ecfdf5" : isDraft ? "#fffbeb" : "#f1f5f9",
                          color: isPublished ? "#059669" : isDraft ? "#d97706" : "#475569",
                          border: `1px solid ${isPublished ? "#a7f3d0" : isDraft ? "#fde68a" : "#e2e8f0"
                            }`,
                        }}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Featured */}
                    <td>
                      {product.featured ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span>Featured</span>
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#854d0e", fontWeight: 500 }}>
                            Home Rank #{product.featuredOrder || "—"}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
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
  );
}

