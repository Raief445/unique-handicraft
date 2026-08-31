"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProductForm.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  status: string;
  image: string | null;
};

export default function CategoryForm({ category }: { category: Category | null }) {
  const router = useRouter();
  const isEdit = !!category;

  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    displayOrder: category?.displayOrder?.toString() || "0",
    status: category?.status || "ACTIVE",
  });

  const [imageUrl, setImageUrl] = useState<string>(category?.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setForm((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageUrl) fd.append("imageUrl", imageUrl);

      const url = isEdit ? `/api/admin/categories/${category!.id}` : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        setError(data.error || "Failed to save category.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${category!.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGrid}>
        <section className={styles.section}>
          <h3>Category Details</h3>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Coffee Tables" />
            </div>
            <div className={styles.field}>
              <label>Slug *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input name="slug" value={form.slug} onChange={handleChange} required placeholder="coffee-tables" style={{ flex: 1 }} />
                <button type="button" onClick={generateSlug} className="btn-secondary" style={{ padding: "0 1rem" }}>Generate</button>
              </div>
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Category description..." />
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Display Order</label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Category Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/category.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl.trim() !== "" && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 6 }}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/categories")}>
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} className={styles.deleteBtn}>
            Delete Category
          </button>
        )}
      </div>
    </form>
  );
}
