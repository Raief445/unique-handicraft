"use client";

import Link from "next/link";
import Image from "next/image";
import { useEnquiryCart } from "./EnquiryCartContext";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    productCode: string;
    shortDescription: string | null;
    mainImage: string;
    length: number | null;
    width: number | null;
    height: number | null;
    dimensionUnit: string | null;
    material: string | null;
  };
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useEnquiryCart();

  const handleAddToEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      productCode: product.productCode,
      image: product.mainImage,
      quantity: 1,
    });
    alert("Added to Enquiry Cart!");
  };

  const dimensions =
    product.length && product.width && product.height
      ? `${product.length} × ${product.width} × ${product.height} ${product.dimensionUnit || "cm"}`
      : "Contact for dimensions";

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <Image src={product.mainImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={priority} className={styles.image} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{product.name}</h3>
          <p className={styles.code}>Product Code: {product.productCode}</p>
          <div className={styles.specs}>
            <p>{dimensions}</p>
          </div>
        </div>
      </Link>
      <div className={styles.actions}>
        <Link href={`/products/${product.id}`} className={styles.viewBtn}>
          View Product
        </Link>
        <button onClick={handleAddToEnquiry} className={styles.addBtn}>
          Add to Enquiry
        </button>
      </div>
    </div>
  );
}
