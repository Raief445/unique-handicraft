"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      alert("An error occurred while deleting the product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: "none",
        border: "none",
        color: "#e53e3e",
        cursor: isDeleting ? "not-allowed" : "pointer",
        padding: 0,
        font: "inherit",
        textDecoration: "underline",
        opacity: isDeleting ? 0.5 : 1,
      }}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
