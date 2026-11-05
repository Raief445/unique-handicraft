import prisma from "@/lib/db";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";
import styles from "./product.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 3600; // Cache for 1 hour

const SITE_ORIGIN = "https://uniquehandicrafts.in";

function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return `${SITE_ORIGIN}/icon.png`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}

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

  const rawImage = product.images[0]?.imageUrl || "https://i.postimg.cc/Vs46MpNq/logo.png";
  const mainImage = toAbsoluteUrl(rawImage);

  // Read custom DB seoTitle & seoDescription or use sensible fallbacks
  const categoryName = product.category?.name || "Handcrafted Furniture";
  const materialText = product.material ? ` in ${product.material}` : "";
  
  const titleText = product.seoTitle?.trim() || `${product.name}${materialText} | ${categoryName}`;
  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    `Premium handcrafted ${categoryName.toLowerCase()} — ${product.name}. Handcrafted from ${product.material || "solid wood"} by Unique Timber & Handicraft in Jodhpur. Request a bespoke quotation.`;

  // If titleText already contains brand suffix or "|", use { absolute: titleText } so Next.js doesn't double-suffix
  const titleMeta = titleText.includes("|")
    ? { absolute: titleText }
    : titleText;

  const fullOgTitle = titleText.includes("|")
    ? titleText
    : `${titleText} | Unique Timber & Handicraft`;

  return {
    title: titleMeta,
    description: description,
    alternates: {
      canonical: `/products/${product.id}`,
    },
    openGraph: {
      title: fullOgTitle,
      description: description,
      url: `${SITE_ORIGIN}/products/${product.id}`,
      siteName: "Unique Timber & Handicraft",
      images: [
        {
          url: mainImage,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullOgTitle,
      description: description,
      images: [mainImage],
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_ORIGIN}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": `${SITE_ORIGIN}/products`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category.name,
        "item": `${SITE_ORIGIN}/products?category=${product.categoryId}`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": `${SITE_ORIGIN}/products/${product.id}`,
      },
    ],
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
          material={product.material}
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

                {product.moq !== null && product.moq !== undefined && (
                  <tr>
                    <td>Order Quantity</td>
                    <td>
                      {product.moq <= 1
                        ? "Single piece and bulk orders welcome"
                        : `Minimum order ${product.moq} units (bulk/trade enquiry)`}
                    </td>
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
