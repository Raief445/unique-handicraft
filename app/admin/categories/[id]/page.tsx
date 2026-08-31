import prisma from "@/lib/db";
import CategoryForm from "@/components/admin/CategoryForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!category) return notFound();

  return (
    <div>
      <h1 style={{ marginBottom: "var(--spacing-xl)", fontSize: "1.75rem", color: "var(--color-primary)" }}>
        Edit Category
      </h1>
      <CategoryForm category={category as any} />
    </div>
  );
}
