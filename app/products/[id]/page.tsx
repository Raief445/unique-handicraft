import prisma from "@/lib/db";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";
import styles from "./product.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  return (
    <div className={`container ${styles.wrapper}`}>
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
