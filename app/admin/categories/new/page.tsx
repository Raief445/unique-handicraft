import CategoryForm from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 style={{ marginBottom: "var(--spacing-xl)", fontSize: "1.75rem", color: "var(--color-primary)" }}>
        Add New Category
      </h1>
      <CategoryForm category={null} />
    </div>
  );
}
