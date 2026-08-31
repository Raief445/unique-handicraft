"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProductForm.module.css";

type Category = { id: string; name: string };
type ProductImage = { id: string; imageUrl: string; imageType: string | null };
type Product = {
  id: string;
  productCode: string;
  name: string;
  categoryId: string;
  shortDescription: string | null;
  description: string | null;
  material: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string | null;
  weight: number | null;
  weightUnit: string | null;
  finish: string | null;
  colour: string | null;
  moq: number | null;
  customizationAvailable: boolean;
  featured: boolean;
  featuredOrder: number;
  isHero: boolean;
  status: string;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImage[];
};

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product: Product | null;
}) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    productCode: product?.productCode || "",
    name: product?.name || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    material: product?.material || "",
    length: product?.length?.toString() || "",
    width: product?.width?.toString() || "",
    height: product?.height?.toString() || "",
    dimensionUnit: product?.dimensionUnit || "cm",
    weight: product?.weight?.toString() || "",
    weightUnit: product?.weightUnit || "kg",
    finish: product?.finish || "",
    colour: product?.colour || "",
    moq: product?.moq?.toString() || "1",
    customizationAvailable: product?.customizationAvailable || false,
    featured: product?.featured || false,
    featuredOrder: product?.featuredOrder?.toString() || "0",
    isHero: product?.isHero || false,
    status: product?.status || "DRAFT",
    displayOrder: product?.displayOrder?.toString() || "0",
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
  });

  const [mainImageUrl, setMainImageUrl] = useState<string>(
    product?.images?.find(i => i.imageType === "MAIN")?.imageUrl || ""
  );
  const [galleryImageUrls, setGalleryImageUrls] = useState<string>(
    product?.images?.filter(i => i.imageType !== "MAIN").map(i => i.imageUrl).join(",\n") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (mainImageUrl) fd.append("mainImageUrl", mainImageUrl);
      if (galleryImageUrls) fd.append("galleryImageUrls", galleryImageUrls);

      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(data.error || "Failed to save product.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to archive this product? It will be hidden from the public site.")) return;
    const res = await fetch(`/api/admin/products/${product!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGrid}>
        {/* Basic Info */}
        <section className={styles.section}>
          <h3>Basic Information</h3>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Mango Wood Coffee Table" />
            </div>
            <div className={styles.field}>
              <label>Product Code *</label>
              <input name="productCode" value={form.productCode} onChange={handleChange} required placeholder="e.g. UT-CT-001" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Category *</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Short Description</label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="Brief one-line description" />
          </div>
          <div className={styles.field}>
            <label>Full Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Detailed product description..." />
          </div>
        </section>

        {/* Dimensions */}
        <section className={styles.section}>
          <h3>Dimensions</h3>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>Length</label>
              <input name="length" type="number" step="0.1" value={form.length} onChange={handleChange} placeholder="e.g. 120" />
            </div>
            <div className={styles.field}>
              <label>Width</label>
              <input name="width" type="number" step="0.1" value={form.width} onChange={handleChange} placeholder="e.g. 60" />
            </div>
            <div className={styles.field}>
              <label>Height</label>
              <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} placeholder="e.g. 45" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Dimension Unit</label>
            <select name="dimensionUnit" value={form.dimensionUnit} onChange={handleChange}>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
              <option value="inch">inch</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </section>

        {/* Material & Specs */}
        <section className={styles.section}>
          <h3>Material & Specifications</h3>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Material</label>
              <input name="material" value={form.material} onChange={handleChange} placeholder="e.g. Mango Wood" />
            </div>
            <div className={styles.field}>
              <label>Finish</label>
              <input name="finish" value={form.finish} onChange={handleChange} placeholder="e.g. Natural, Painted" />
            </div>
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Colour</label>
              <input name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. Natural Wood" />
            </div>
            <div className={styles.field}>
              <label>MOQ (Min. Order Qty)</label>
              <input name="moq" type="number" min={1} value={form.moq} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className={styles.section}>
          <h3>Images</h3>
          <div className={styles.field}>
            <label>Main Product Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
            />
            {mainImageUrl.trim() !== "" && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Main image preview:</p>
                <img
                  src={mainImageUrl.trim()}
                  alt="Main preview"
                  style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 6 }}
                />
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label>Gallery Image URLs (Comma-separated)</label>
            <textarea
              rows={3}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              value={galleryImageUrls}
              onChange={(e) => setGalleryImageUrls(e.target.value)}
            />
          </div>
          {galleryImageUrls.trim() !== "" && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>Gallery previews:</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {galleryImageUrls.split(",").map(u => u.trim()).filter(u => u !== "").map((url, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", maxWidth: 150 }}>
                    <img
                      src={url}
                      alt="Gallery preview"
                      style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Settings */}
        <section className={styles.section}>
          <h3>Settings</h3>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="PUBLISHED">Published (Visible on site)</option>
                <option value="DRAFT">Draft (Hidden from site)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Display Order</label>
              <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.checkRow}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem'}}>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                <span>Featured Product (Show on home page)</span>
              </label>
              {form.featured && (
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1.5rem'}}>
                  <label style={{fontSize: '0.9rem'}}>Featured Order:</label>
                  <input type="number" name="featuredOrder" value={form.featuredOrder} onChange={handleChange} style={{width: '80px', padding: '0.2rem'}} />
                </div>
              )}
            </div>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="isHero" checked={form.isHero} onChange={handleChange} />
              <span>Set as Hero Image (Main Home Page)</span>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" name="customizationAvailable" checked={form.customizationAvailable} onChange={handleChange} />
              <span>Customization Available</span>
            </label>
          </div>
        </section>

        {/* SEO */}
        <section className={styles.section}>
          <h3>SEO (Optional)</h3>
          <div className={styles.field}>
            <label>SEO Title</label>
            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} placeholder="SEO page title" />
          </div>
          <div className={styles.field}>
            <label>SEO Description</label>
            <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows={3} placeholder="Meta description for search engines" />
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} className={styles.deleteBtn}>
            Archive Product
          </button>
        )}
      </div>
    </form>
  );
}
