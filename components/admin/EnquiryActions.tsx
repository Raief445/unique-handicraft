"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ENQUIRY_STATUSES = [
  { value: "NEW", label: "New Enquiry" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "REQUIREMENT_DISCUSSION", label: "Requirement Discussion" },
  { value: "QUOTATION_SENT", label: "Quotation Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CONFIRMED", label: "Confirmed / Order Placed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CLOSED", label: "Closed / Cancelled" },
];

export default function EnquiryActions({
  enquiryId,
  currentStatus,
}: {
  enquiryId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "white",
      padding: "var(--spacing-xl)",
      borderRadius: "var(--border-radius-md)",
      border: "1px solid var(--color-border)"
    }}>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-md)", color: "var(--color-primary)" }}>
        Manage Enquiry
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Update Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-border)",
            fontSize: "0.9rem"
          }}
        >
          {ENQUIRY_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="btn-primary"
        style={{ width: "100%", padding: "0.75rem" }}
      >
        {loading ? "Updating..." : "Save Status"}
      </button>
    </div>
  );
}
