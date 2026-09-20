import prisma from "@/lib/db";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";
import styles from "./product.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Metadata } from "next";

export const revalidate = 3600; // Cache for 1 hour

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id, status: "PUBLISHED" },
    include: { category: true, images: { where: { imageType: "MAIN" } } },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const mainImage = product.images[0]?.imageUrl || "https://i.postimg.cc/Vs46MpNq/logo.png";
  const description = product.shortDescription || 
    `Premium handcrafted ${product.category?.name?.toLowerCase() || 'furniture'} — ${product.name}. Manufactured by Unique Timber & Handicraft in Jodhpur.`;

  return {
    title: product.name,
    description: description,
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Unique Timber & Handicraft`,
      description: description,
      url: `https://uniquehandicrafts.in/products/${product.id}`,
      images: [
        {
          url: mainImage,
          alt: product.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { id: true },
    where: { status: "PUBLISHED" },
  });
  
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, status: "PUBLISHED" },
    include: {
      images: { orderBy: { displayOrder: "asc" } },
      category: true,
    },
  });

  if (!product) return notFound();

  const mainImage =
    product.images.find((i) => i.imageType === "MAIN")?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://placehold.co/800x600/F0EEE9/3A2F28?text=No+Image";

  const galleryImages = product.images.filter((i) => i.imageType !== "MAIN");

  const dimensions =
    product.length && product.width && product.height
      ? `${product.length} × ${product.width} × ${product.height} ${product.dimensionUnit || "cm"}`
      : null;

  const productForActions = {
    id: product.id,
    name: product.name,
    productCode: product.productCode,
    mainImage,
    moq: product.moq,
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.shortDescription || `Handcrafted ${product.name} by Unique Timber & Handicraft.`,
    "image": mainImage,
    "sku": product.productCode,
    "category": product.category?.name,
    ...(product.material && { "material": product.material }),
    "brand": {
      "@type": "Brand",
      "name": "Unique Timber & Handicraft"
    },
    "url": `https://uniquehandicrafts.in/products/${product.id}`
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.categoryId}`}>{product.category.name}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Left - Gallery */}
        <ProductGallery
          mainImage={mainImage}
          productName={product.name}
          galleryImages={galleryImages}
        />

        {/* Right - Info */}
        <div className={styles.info}>
          <p className={styles.categoryLabel}>{product.category.name}</p>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productCode}>Product Code: {product.productCode}</p>

          {product.shortDescription && (
            <p className={styles.shortDesc}>{product.shortDescription}</p>
          )}

          <div className={styles.specsTable}>
            <h3>Specifications</h3>
            <table>
              <tbody>
                {dimensions && (
                  <tr>
                    <td>Dimensions (L × W × H)</td>
                    <td>{dimensions}</td>
                  </tr>
                )}
                {product.material && (
                  <tr>
                    <td>Material</td>
                    <td>{product.material}</td>
                  </tr>
                )}
                {product.finish && (
                  <tr>
                    <td>Finish</td>
                    <td>{product.finish}</td>
                  </tr>
                )}
                {product.colour && (
                  <tr>
                    <td>Colour</td>
                    <td>{product.colour}</td>
                  </tr>
                )}

                {product.moq && (
                  <tr>
                    <td>Minimum Order Quantity</td>
                    <td>{product.moq} units</td>
                  </tr>
                )}
                <tr>
                  <td>Customization</td>
                  <td>{product.customizationAvailable ? "Available" : "Contact Us"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {product.description && (
            <div className={styles.fullDesc}>
              <h3>Product Details</h3>
              <p>{product.description}</p>
            </div>
          )}

          <ProductDetailActions product={productForActions} />
        </div>
      </div>
    </div>
  );
}
