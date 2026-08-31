"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../app/products/[id]/product.module.css";

type ProductGalleryProps = {
  mainImage: string;
  productName: string;
  galleryImages: { id: string; imageUrl: string }[];
};

export default function ProductGallery({ mainImage, productName, galleryImages }: ProductGalleryProps) {
  const allImages = [{ id: "main-thumb", imageUrl: mainImage }, ...galleryImages];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        <Image 
          src={allImages[currentIndex].imageUrl} 
          alt={productName} 
          fill 
          priority 
          sizes="(max-width: 1024px) 100vw, 50vw" 
          className={styles.mainImage} 
        />
        {allImages.length > 1 && (
          <>
            <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrev}>
              &#10094;
            </button>
            <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNext}>
              &#10095;
            </button>
          </>
        )}
      </div>
      {galleryImages.length > 0 && (
        <div className={styles.thumbnails}>
          {allImages.map((img, index) => (
            <Image
              key={img.id}
              src={img.imageUrl}
              alt={productName}
              width={80}
              height={80}
              className={`${styles.thumb} ${currentIndex === index ? styles.activeThumb : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
