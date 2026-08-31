"use client";

import { useState } from "react";
import { useEnquiryCart } from "@/components/EnquiryCartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Paperclip, Check } from "lucide-react";

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          file: "Only JPG, PNG, and PDF files are allowed",
        }));
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "File size must be less than 10MB" }));
        return;
      }
      setFile(selectedFile);
      setErrors((prev) => ({ ...prev, file: "" }));
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
      if (file) submitData.append("file", file);

      const res = await fetch("/api/enquiry", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (res.ok && data.enquiryNumber) {
        clearCart();
        router.push(`/enquiry/success?number=${data.enquiryNumber}`);
      } else {
        setErrors({ submit: data.error || "Something went wrong. Please try again." });
      }
    } catch (err) {
      setErrors({ submit: "Network error. Please try again." });
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
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  <div className={styles.fileLabel}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}><Paperclip size={20} /> Click to upload or drag and drop</span>
                    <small>Maximum 5MB. PDF, JPG, PNG allowed.</small>
                    {file && <strong className={styles.fileName} style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}><Check size={16} /> {file.name}</strong>}
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
                <img
                  src={item.image || "https://placehold.co/60x50/F0EEE9/3A2F28?text=No+Image"}
                  alt={item.name}
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
