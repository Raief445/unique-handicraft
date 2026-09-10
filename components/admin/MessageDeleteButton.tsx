"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function MessageDeleteButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete message");
      }
    } catch (error) {
      alert("Error deleting message");
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
        color: "var(--color-text-light)",
        cursor: "pointer",
        padding: "0.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title="Delete Message"
    >
      <Trash2 size={18} color="red" />
    </button>
  );
}
