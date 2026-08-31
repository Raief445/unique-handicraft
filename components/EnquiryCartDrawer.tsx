"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useEnquiryCart } from "./EnquiryCartContext";
import styles from "./EnquiryCartDrawer.module.css";
import Image from "next/image";

export default function EnquiryCartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, itemCount } = useEnquiryCart();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <>
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.open : ""}`} 
        onClick={closeCart} 
        aria-hidden="true" 
      />
      <div className={`${styles.drawer} ${isCartOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2>{itemCount} {itemCount === 1 ? 'PRODUCT' : 'PRODUCTS'} SELECTED</h2>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Close cart">&times;</button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>No products selected.</p>
              <button className={styles.emptyBtn} onClick={closeCart}>BROWSE PRODUCTS</button>
            </div>
          ) : (
            <div className={styles.cartItems}>
              {items.map((item) => (
                <div key={item.productId} className={styles.cartItem}>
                  <div className={styles.itemImageWrapper}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p className={styles.itemCode}>{item.productCode}</p>
                    
                    <div className={styles.itemActions}>
                      <div className={styles.quantityControls}>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <Link href="/enquiry" className={styles.proceedBtn} onClick={closeCart}>
              PROCEED TO ENQUIRY
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
