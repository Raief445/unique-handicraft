"use client";

import { useState } from "react";
import { MapPin, Mail, Clock, ClipboardList, CheckCircle } from "lucide-react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.hero}>
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with Unique Timber & Handicraft</p>
        </div>
      </div>

      <div className={`container ${styles.wrapper}`}>
        {/* Contact Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><MapPin size={24} strokeWidth={1.5} /></div>
            <div>
              <h3>Location</h3>
              <p>Jodhpur, Rajasthan, India</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><Mail size={24} strokeWidth={1.5} /></div>
            <div>
              <h3>Email</h3>
              <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com">
                uniquetimberhandicraftjodhpur@gmail.com
              </a>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><Clock size={24} strokeWidth={1.5} /></div>
            <div>
              <h3>Business Hours</h3>
              <p>Monday – Saturday, 10 AM – 6 PM (IST)</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}><ClipboardList size={24} strokeWidth={1.5} /></div>
            <div>
              <h3>For Product Enquiries</h3>
              <p>Use our Enquiry Cart for product-specific enquiries</p>
              <a href="/products" className={styles.infoLink}>Browse Products →</a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formSection}>
          {submitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}><CheckCircle size={32} strokeWidth={1.5} /></div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We will respond as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2>Send Us a Message</h2>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="c-name">Your Name *</label>
                  <input id="c-name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Full Name" />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="c-company">Company Name *</label>
                  <input id="c-company" name="company" type="text" required value={form.company} onChange={handleChange} placeholder="Company Name" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="c-email">Email Address *</label>
                  <input id="c-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="email@company.com" />
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="c-phone">Phone</label>
                  <input id="c-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c-subject">Subject *</label>
                <input id="c-subject" name="subject" type="text" required value={form.subject} onChange={handleChange} placeholder="What is this regarding?" />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="c-message">Message *</label>
                <textarea
                  id="c-message"
                  name="message"
                  rows={6}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Please describe your enquiry or message..."
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
