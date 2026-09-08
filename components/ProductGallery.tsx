"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import styles from "../app/products/[id]/product.module.css";

type ProductGalleryProps = {
  mainImage: string;
  productName: string;
  galleryImages: { id: string; imageUrl: string }[];
};

export default function ProductGallery({ mainImage, productName, galleryImages }: ProductGalleryProps) {
  const allImages = [{ id: "main-thumb", imageUrl: mainImage }, ...galleryImages];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className={styles.gallery}>
      <div className={styles.mainImageWrapper}>
        {allImages.map((img, index) => (
          <Image 
            key={img.id}
            src={img.imageUrl} 
            alt={`${productName} - Image ${index + 1}`} 
            fill 
            priority={index === 0} 
            sizes="(max-width: 1024px) 100vw, 50vw" 
            className={styles.mainImage}
            onClick={() => setIsLightboxOpen(true)}
            style={{ 
              cursor: 'zoom-in',
              opacity: currentIndex === index ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: currentIndex === index ? 1 : 0
            }}
          />
        ))}
        <button 
          className={styles.zoomBtn} 
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          aria-label="Zoom Image"
        >
          <ZoomIn size={20} strokeWidth={2} />
        </button>
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

    {/* Lightbox Modal */}
    <div 
      className={styles.lightbox} 
      onClick={() => setIsLightboxOpen(false)}
      style={{
        opacity: isLightboxOpen ? 1 : 0,
        visibility: isLightboxOpen ? 'visible' : 'hidden',
        pointerEvents: isLightboxOpen ? 'auto' : 'none',
        animation: 'none',
        transition: 'opacity 0.2s ease, visibility 0.2s'
      }}
    >
      <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)} aria-label="Close Lightbox">
          <X size={24} />
        </button>
        <Image 
          src={allImages[currentIndex].imageUrl} 
          alt={productName} 
          fill 
          sizes="100vw"
          unoptimized={true}
          style={{ objectFit: 'contain' }} 
        />
      </div>
    </div>
    </>
  );
}
