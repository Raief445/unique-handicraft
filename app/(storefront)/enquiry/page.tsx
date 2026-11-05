"use client";

import { useState } from "react";
import { useEnquiryCart } from "@/components/EnquiryCartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Paperclip, Check, Loader2, X } from "lucide-react";
import Image from "next/image";

/**
 * Compresses an image file on the client side using HTML5 Canvas.
 * Reduces 10MB+ phone camera photos to ~300KB-600KB full-HD JPEGs,
 * ensuring fast upload times and avoiding Vercel 4.5MB serverless limits.
 */
function compressImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.FileReader) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const MAX_DIMENSION = 1920;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              try {
                const compressed = new File([blob], `${baseName}.jpg`, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressed);
              } catch {
                const fallback = blob as any;
                fallback.name = `${baseName}.jpg`;
                resolve(fallback);
              }
            },
            "image/jpeg",
            0.82
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function EnquiryPage() {
  const { items, clearCart } = useEnquiryCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    location: "",
    country: "",
    designation: "",
    expectedQuantity: "",
    deliveryDate: "",
    customizationRequired: "no",
    message: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const required = ["fullName", "companyName", "email", "location", "country"];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    required.forEach((field) => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = "This field is required";
      }
    });
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (items.length === 0) {
      newErrors.cart = "Your enquiry cart is empty. Please add products first.";
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setErrors((prev) => ({ ...prev, file: "" }));

    const fileName = selectedFile.name.toLowerCase();
    const isPdf = selectedFile.type === "application/pdf" || fileName.endsWith(".pdf");
    const isImage =
      selectedFile.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(fileName);

    if (!isPdf && !isImage) {
      setErrors((prev) => ({
        ...prev,
        file: "Only image files (JPG, PNG, WEBP) and PDF documents are allowed.",
      }));
      return;
    }

    if (isPdf) {
      if (selectedFile.size > 4.5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "PDF file size must be less than 4.5MB.",
        }));
        return;
      }
      setFile(selectedFile);
      return;
    }

    // It's an image: automatically compress for mobile and fast network upload
    try {
      setOptimizing(true);
      const optimized = await compressImageFile(selectedFile);
      setFile(optimized);
    } catch {
      if (selectedFile.size > 4.5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "Image is too large. Please select an image smaller than 4.5MB.",
        }));
      } else {
        setFile(selectedFile);
      }
    } finally {
      setOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        submitData.append(key, value)
      );
      submitData.append("items", JSON.stringify(items));
      if (file) {
        submitData.append("file", file, file.name || "reference.jpg");
      }

      const res = await fetch("/api/enquiry", {
        method: "POST",
        body: submitData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        if (res.status === 413) {
          setErrors({ submit: "The uploaded file is too large for upload. Please select a smaller photo or document." });
          return;
        }
        setErrors({ submit: "Unable to process enquiry. Please try again or contact us directly." });
        return;
      }

      if (res.ok && data?.enquiryNumber) {
        clearCart();
        router.push(`/enquiry/success?number=${data.enquiryNumber}`);
      } else {
        setErrors({ submit: data?.error || "Something went wrong. Please try again." });
      }
    } catch (err) {
      setErrors({ submit: "Network error. Please try again or check your internet connection." });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyWrapper}`}>
        <div className={styles.emptyState}>
          <h2>Your enquiry cart is empty</h2>
          <p>Please browse our products and add them to your enquiry cart first.</p>
          <Link href="/products" className="btn-primary mt-3">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.pageHeader}>
        <h1>Submit Your Enquiry</h1>
        <p>Fill in your details below. Our team will review your requirements and contact you.</p>
      </div>

      <div className={styles.layout}>
        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && (
            <div className={styles.errorAlert}>{errors.submit}</div>
          )}

          <section className={styles.section}>
            <h2>Customer Information</h2>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="fullName">Full Name <span className={styles.req}>*</span></label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={errors.fullName ? styles.inputError : ""}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="companyName">Company Name <span className={styles.req}>*</span></label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className={errors.companyName ? styles.inputError : ""}
                />
                {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="email">Email Address <span className={styles.req}>*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={errors.email ? styles.inputError : ""}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={errors.phone ? styles.inputError : ""}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="location">City / Location <span className={styles.req}>*</span></label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  className={errors.location ? styles.inputError : ""}
                />
                {errors.location && <span className={styles.errorText}>{errors.location}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="country">Country <span className={styles.req}>*</span></label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                  className={errors.country ? styles.inputError : ""}
                />
                {errors.country && <span className={styles.errorText}>{errors.country}</span>}
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label htmlFor="designation">Designation / Job Title (Optional)</label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Procurement Manager, Interior Designer"
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Requirement Information</h2>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="expectedQuantity">Expected Total Quantity</label>
                <input
                  id="expectedQuantity"
                  name="expectedQuantity"
                  type="number"
                  min={1}
                  max={10000}
                  value={formData.expectedQuantity}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="deliveryDate">Required Delivery Date (Optional)</label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label htmlFor="customizationRequired">Customization Required?</label>
                <select
                  id="customizationRequired"
                  name="customizationRequired"
                  value={formData.customizationRequired}
                  onChange={handleChange}
                >
                  <option value="no">No - Standard product</option>
                  <option value="yes">Yes - I need customization</option>
                </select>
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label htmlFor="message">Additional Requirements</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your quantity requirements, preferred dimensions, finish, customization, delivery requirements or any other information."
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label htmlFor="file">Upload Reference Design / Image (Optional)</label>
                <div className={styles.fileUploadArea}>
                  <input
                    id="file"
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  <div className={styles.fileLabel}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <Paperclip size={20} /> Click to upload or drag and drop
                    </span>
                    <small>JPG, PNG, WEBP, or PDF (photos automatically optimized for mobile upload)</small>
                    {optimizing && (
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c1a27a", fontSize: "0.85rem", marginTop: "4px" }}>
                        <Loader2 size={16} className={styles.spinnerIcon} /> Optimizing photo for fast upload...
                      </span>
                    )}
                    {file && !optimizing && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                        <strong className={styles.fileName} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={16} /> {file.name} ({(file.size / 1024).toFixed(0)} KB)
                        </strong>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFile(null);
                            const input = document.getElementById("file") as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                            textDecoration: "underline",
                          }}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {errors.file && <span className={styles.errorText}>{errors.file}</span>}
              </div>
            </div>
          </section>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Submitting Enquiry..." : "Submit Enquiry"}
          </button>
        </form>

        {/* Order Summary */}
        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3>Enquiry Summary</h3>
            {items.map((item) => (
              <div key={item.productId} className={styles.summaryItem}>
                <Image
                  src={item.image || "https://placehold.co/60x50/F0EEE9/3A2F28?text=No+Image"}
                  alt={item.name}
                  width={50}
                  height={45}
                  priority={true}
                  className={styles.summaryImg}
                />
                <div className={styles.summaryText}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemCode}>{item.productCode}</span>
                </div>
                <span className={styles.itemQty}>Qty: {item.quantity}</span>
              </div>
            ))}
            <Link href="/enquiry-cart" className={styles.editCartLink}>
              ← Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
