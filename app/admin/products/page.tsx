import prisma from "@/lib/db";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import styles from "../dashboard.module.css";
import ProductListTable from "@/components/admin/ProductListTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      status: {
        not: "ARCHIVED",
      },
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { displayOrder: "asc" } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Product Catalogue</h1>
            <p>{products.length} artisanal furniture pieces in collection</p>
          </div>
          <Link href="/admin/products/new" className={styles.quickBtnPrimary}>
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className={styles.section} style={{ padding: "1.25rem" }}>
        <ProductListTable initialProducts={products as any} />
      </div>
    </div>
  );
}
