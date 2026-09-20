"use client";

import { useState } from "react";
import { CheckCircle, MapPin, Mail, Clock, ClipboardList } from "lucide-react";
import Link from "next/link";
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Unique Timber & Handicraft",
    "image": "https://i.postimg.cc/Vs46MpNq/logo.png",
    "email": "uniquetimberhandicraftjodhpur@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jodhpur",
      "addressRegion": "Rajasthan",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "18:00"
    },
    "url": "https://uniquehandicrafts.in/contact"
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.heroEyebrow}>CONTACT</div>
          <h1>Let’s discuss what you’re looking to make.</h1>
          <p>For product enquiries, custom manufacturing and commercial requirements, get in touch with our team in Jodhpur.</p>
        </div>
      </div>

      <div className={`container ${styles.wrapper}`}>
        {/* Contact Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoGroup}>
            <h2 className={styles.infoMainTitle}>CONTACT INFORMATION</h2>
            
            <div className={styles.infoBlock}>
              <h3><MapPin size={15} strokeWidth={2} /> LOCATION</h3>
              <p>Jodhpur, Rajasthan, India</p>
            </div>
            
            <div className={styles.infoBlock}>
              <h3><Mail size={15} strokeWidth={2} /> EMAIL</h3>
              <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com">
                uniquetimberhandicraftjodhpur@gmail.com
              </a>
            </div>
            
            <div className={styles.infoBlock}>
              <h3><Clock size={15} strokeWidth={2} /> BUSINESS HOURS</h3>
              <p>Monday – Saturday, 10 AM – 6 PM (IST)</p>
            </div>
          </div>
          
          <div className={styles.infoDivider}></div>

          <div className={styles.infoGroup}>
            <h2 className={styles.infoMainTitle}><ClipboardList size={20} strokeWidth={1.5} /> FOR PRODUCT ENQUIRIES</h2>
            <div className={styles.infoBlock}>
              <p className={styles.subtext}>Use our Enquiry Cart for product-specific enquiries.</p>
              <Link href="/products" className={styles.infoLink}>Browse Products →</Link>
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
