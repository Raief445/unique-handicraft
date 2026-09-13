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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/enquiries");
        router.refresh();
      } else {
        alert("Failed to delete enquiry");
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

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="btn-primary"
          style={{ width: "100%", padding: "0.75rem" }}
        >
          {loading ? "Processing..." : "Save Status"}
        </button>
        
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "0.75rem", 
            background: "transparent", 
            border: "1px solid #E53E3E", 
            color: "#E53E3E",
            borderRadius: "var(--border-radius-sm)",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Delete Enquiry
        </button>
      </div>
    </div>
  );
}
