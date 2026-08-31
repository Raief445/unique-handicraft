import Link from "next/link";
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import styles from "./page.module.css";
import { ArrowRight } from "lucide-react";

// Force dynamic rendering since we want products to update live when admin adds them
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch categories
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { displayOrder: "asc" },
  });

  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
    },
    include: {
      images: {
        where: { imageType: "MAIN" },
        take: 1,
      },
    },
    orderBy: {
      featuredOrder: "asc",
    },
    take: 8,
  });

  const fallbackSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20600%20400%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F0EEE9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%233A2F28%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

  const formattedProducts = featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    productCode: p.productCode,
    shortDescription: p.shortDescription,
    mainImage: p.images[0]?.imageUrl || fallbackSvg,
    length: p.length,
    width: p.width,
    height: p.height,
    dimensionUnit: p.dimensionUnit,
    material: p.material,
  }));

  const heroProductData = await prisma.product.findFirst({
    where: { status: "PUBLISHED", isHero: true },
    include: { images: { where: { imageType: "MAIN" }, take: 1 } },
  });

  const mainHeroImage = heroProductData?.images[0]?.imageUrl || formattedProducts[0]?.mainImage || fallbackSvg;

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img src={mainHeroImage} alt="Unique Timber & Handicraft" className={styles.heroImgFitted} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <ScrollReveal direction="up" delay={0}>
            <h1>The Heritage of Jodhpur. Handcrafted for the World.</h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={150}>
            <div className={styles.heroTags}>
              <span>Jodhpur, Rajasthan</span>
              <span>·</span>
              <span>Working Since 2019</span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className={styles.heroActions}>
              <Link href="/products" className="btn-primary">
                Explore Products
              </Link>
              <Link href="/contact" className={styles.btnPrimaryOutline}>
                Start an Enquiry
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className={styles.aboutSnippetSection}>
        <div className={`container ${styles.aboutSnippetContent}`}>
          <ScrollReveal direction="up" className={styles.aboutSnippetText}>
            <h2>Your Trusted Partner in Premium Furniture Manufacturing.</h2>
            <p>
              Unique Timber & Handicraft is a Jodhpur-based furniture manufacturing business operating since 2019. We specialize in providing exceptional, handcrafted solid wood products tailored for commercial spaces. From hospitality projects and retail showrooms to global wholesale distribution, our master artisans combine traditional Rajasthani craftsmanship with modern durability. We are committed to uncompromised quality, sustainable sourcing, and building long-lasting partnerships with businesses worldwide.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {categories.length > 0 && (
        <section className={styles.categoriesSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} text-center`}>Our Categories</h2>
              <p className="text-center text-muted mt-2" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
                Discover our curated collection of handcrafted solid wood furniture, designed to bring timeless elegance and durability to your living spaces.
              </p>
            </div>
            <div className={styles.categoriesGrid}>
              {categories.map((cat, index) => (
                <ScrollReveal key={cat.id} delay={index * 100} direction="up">
                  <Link href={`/products?category=${cat.id}`} className={styles.categoryCard}>
                    <div className={styles.catImageWrapper}>
                      <img
                        src={cat.image || fallbackSvg}
                        alt={cat.name}
                        className={styles.catImgFitted}
                      />
                    </div>
                    <div className={styles.catInfo}>
                      <h3>{cat.name}</h3>
                      <span className={styles.exploreLink} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>Explore Collection <ArrowRight size={14} /></span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {formattedProducts.length > 0 && (
        <section className={styles.featuredSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={`${styles.sectionTitle} text-center`}>Featured Products</h2>
              <p className="text-center text-muted mt-2" style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
                Explore our most sought-after pieces, showcasing exceptional craftsmanship, rich wood grains, and uncompromising quality.
              </p>
            </div>
            <div className={styles.productsGrid}>
              {formattedProducts.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 100} direction="up">
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal delay={200}>
              <div className="text-center mt-4">
                <Link href="/products" className="btn-primary">
                  View All Products
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  );
}
