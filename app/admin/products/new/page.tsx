import prisma from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <h1 style={{ marginBottom: "var(--spacing-xl)", fontSize: "1.75rem", color: "var(--color-primary)" }}>
        Add New Product
      </h1>
      <ProductForm categories={categories} product={null} />
    </div>
  );
}
