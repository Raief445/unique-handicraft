"use client";

import { useState } from "react";
import { useEnquiryCart } from "./EnquiryCartContext";
import styles from "./ProductDetailActions.module.css";
import Link from "next/link";

export default function ProductDetailActions({ product }: { product: any }) {
  const { addItem } = useEnquiryCart();
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const qty = Math.max(1, Math.min(1000, quantity));
    addItem({
      productId: product.id,
      name: product.name,
      productCode: product.productCode,
      image: product.mainImage,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.quantityWrapper}>
        <label htmlFor="qty">Quantity</label>
        <div className={styles.qtyControl}>
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <input
            id="qty"
            type="number"
            value={quantity}
            min={1}
            max={1000}
            onChange={(e) => setQuantity(Math.min(1000, parseInt(e.target.value) || 1))}
          />
          <button onClick={() => setQuantity(Math.min(1000, quantity + 1))}>+</button>
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={handleAdd} className={styles.primaryBtn}>
          {added ? "Added to Enquiry List ✓" : "Enquire About This Piece"}
        </button>
        <Link href="/contact" className={styles.secondaryBtn}>
          Request Customization
        </Link>
      </div>
      {added && (
        <p className={styles.successMsg}>
          Piece added to enquiry list! <Link href="/enquiry-cart">View Selected Pieces →</Link>
        </p>
      )}
      <div className={styles.reassurance}>
        <p>Single-piece and bulk enquiries welcome.</p>
        <p>Personalised quotation with finish & delivery details shared after enquiry.</p>
      </div>
    </div>
  );
}
