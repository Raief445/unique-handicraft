import prisma from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.category.findMany({ where: { status: "ACTIVE" }, orderBy: { displayOrder: "asc" } }),
  ]);

  if (!product) return notFound();

  return (
    <div>
      <h1 style={{ marginBottom: "var(--spacing-xl)", fontSize: "1.75rem", color: "var(--color-primary)" }}>
        Edit Product
      </h1>
      <ProductForm categories={categories} product={product as any} />
    </div>
  );
}
