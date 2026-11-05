"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

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
  customerEmail,
  customerName,
}: {
  enquiryId: string;
  currentStatus: string;
  customerEmail?: string | null;
  customerName?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const router = useRouter();

  const handleUpdate = async () => {
    if (status === currentStatus && !customNote.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notifyCustomer,
          customNote: customNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.emailSent) {
          setFeedback({
            type: "success",
            message: `Status updated to ${status.replace(/_/g, " ")} & email notification sent to ${customerEmail || "customer"}!`,
          });
        } else if (notifyCustomer && status !== currentStatus) {
          setFeedback({
            type: "warning",
            message: `Status updated to ${status.replace(/_/g, " ")}. (Email note: ${data.emailReason || "Email skipped"})`,
          });
        } else {
          setFeedback({
            type: "success",
            message: `Status updated to ${status.replace(/_/g, " ")} successfully.`,
          });
        }
        setCustomNote("");
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: data.error || "Failed to update status",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Network error occurred while updating status.",
      });
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

  const hasChanges = status !== currentStatus || customNote.trim().length > 0;

  return (
    <div
      style={{
        background: "white",
        padding: "var(--spacing-xl)",
        borderRadius: "var(--border-radius-md)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          marginBottom: "var(--spacing-md)",
          color: "var(--color-primary)",
        }}
      >
        Manage Enquiry
      </h3>

      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "var(--border-radius-sm)",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            lineHeight: 1.4,
            background:
              feedback.type === "success"
                ? "#f0fdf4"
                : feedback.type === "warning"
                ? "#fffbeb"
                : "#fef2f2",
            border: `1px solid ${
              feedback.type === "success"
                ? "#bbf7d0"
                : feedback.type === "warning"
                ? "#fde68a"
                : "#fecaca"
            }`,
            color:
              feedback.type === "success"
                ? "#15803d"
                : feedback.type === "warning"
                ? "#b45309"
                : "#b91c1c",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
          ) : (
            <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>Update Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-border)",
            fontSize: "0.9rem",
            backgroundColor: "#fff",
          }}
        >
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "#faf8f5",
          padding: "0.875rem",
          borderRadius: "var(--border-radius-sm)",
          border: "1px solid #ebdcd0",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-primary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={notifyCustomer}
            onChange={(e) => setNotifyCustomer(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#3A2F28" }}
          />
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Mail size={15} />
            Notify customer via email
          </span>
        </label>

        {customerEmail && (
          <div style={{ fontSize: "0.78rem", color: "#666", paddingLeft: "1.5rem" }}>
            Recipient: <strong>{customerEmail}</strong>
          </div>
        )}

        {notifyCustomer && (
          <div style={{ marginTop: "0.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#555",
                marginBottom: "0.35rem",
              }}
            >
              Optional note to customer (included in email):
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Our team has reviewed your specifications and we will call you today..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "var(--border-radius-sm)",
                border: "1px solid var(--color-border)",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <button
          onClick={handleUpdate}
          disabled={loading || !hasChanges}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "0.75rem",
            opacity: loading || !hasChanges ? 0.6 : 1,
            cursor: loading || !hasChanges ? "not-allowed" : "pointer",
          }}
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
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
            transition: "all 0.2s",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.background = "#fff5f5";
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.background = "transparent";
          }}
        >
          Delete Enquiry
        </button>
      </div>
    </div>
  );
}
