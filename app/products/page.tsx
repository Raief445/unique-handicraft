import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import styles from "./products.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { category, search } = searchParams;

  // Build where clause
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (category) {
    whereClause.categoryId = category;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search } }, // Case insensitive in SQLite via PRAGMA, but Prisma contains is CS in SQLite unless tweaked, so we keep it simple
      { productCode: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: {
        where: { imageType: "MAIN" },
        take: 1,
      },
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
  });

  const fallbackSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F0EEE9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%233A2F28%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

  const formattedProducts = products.map((p) => ({
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

  return (
    <div className={styles.pageWrapper}>
      <div className={`container ${styles.header}`}>
        <h1>Product Catalogue</h1>
        <p>Explore our premium handcrafted products.</p>
      </div>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Search</h3>
            <form action="/products" method="GET" className={styles.searchForm}>
              {category && <input type="hidden" name="category" value={category} />}
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                defaultValue={search || ""}
                className={styles.searchInput}
              />
              <button type="submit" className="btn-secondary">Search</button>
            </form>
          </div>

          <div className={styles.filterGroup}>
            <h3>Categories</h3>
            <ul className={styles.categoryList}>
              <li>
                <Link href="/products" className={!category ? styles.active : ""}>
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.id}`}
                    className={category === cat.id ? styles.active : ""}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li style={{ marginTop: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                <Link href="/custom-manufacturing" style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                  Custom Manufacturing ↗
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        <main className={styles.mainContent}>
          {formattedProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No products found</h2>
              <p>Try adjusting your search or filters.</p>
              <Link href="/products" className="btn-primary mt-3">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {formattedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
