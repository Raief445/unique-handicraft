"use client";

import { useState } from "react";
import { useEnquiryCart } from "@/components/EnquiryCartContext";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function EnquiryCartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useEnquiryCart();

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyWrapper}`}>
        <div className={styles.emptyState}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2>Your Enquiry Cart is Empty</h2>
          <p>Browse our product catalogue and add items to your enquiry.</p>
          <Link href="/products" className="btn-primary mt-3">Browse Products</Link>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/track-enquiry" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.9rem' }}>
              Already submitted an enquiry? Track it here.
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.header}>
        <h1>Your Enquiry Cart</h1>
        <p>{items.length} product{items.length !== 1 ? "s" : ""} selected for enquiry</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.cartItems}>
          <div className={styles.tableHeader}>
            <span className={styles.colProduct}>Product</span>
            <span className={styles.colQty}>Quantity</span>
            <span className={styles.colAction}>Action</span>
          </div>

          {items.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <div className={styles.productInfo}>
                <Image
                  src={item.image || "https://placehold.co/120x90/F0EEE9/3A2F28?text=No+Image"}
                  alt={item.name}
                  width={80}
                  height={70}
                  className={styles.productImage}
                />
                <div>
                  <h3>{item.name}</h3>
                  <p className={styles.productCode}>Code: {item.productCode}</p>
                </div>
              </div>

              <div className={styles.qtyControl}>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  max={1000}
                  onChange={(e) =>
                    updateQuantity(item.productId, parseInt(e.target.value) || 1)
                  }
                />
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= 1000}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3>Enquiry Summary</h3>
            <div className={styles.summaryList}>
              {items.map((item) => (
                <div key={item.productId} className={styles.summaryItem}>
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className={styles.note}>
              <p>No payment required. We will contact you with pricing after reviewing your requirements.</p>
            </div>
            <Link href="/enquiry" className={`btn-primary ${styles.proceedBtn}`}>
              Proceed to Enquiry
            </Link>
            <Link href="/products" className={`btn-secondary ${styles.continueBtn}`}>
              Continue Browsing
            </Link>
            <button
              onClick={clearCart}
              className={styles.clearBtn}
            >
              Clear All
            </button>
            <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link href="/track-enquiry" style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textDecoration: 'underline' }}>
                Track an existing enquiry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
