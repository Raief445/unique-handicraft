"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle, Clock, Trash2 } from "lucide-react";
import styles from "@/app/admin/invoices/[id]/invoice.module.css";
import { DocumentTypeEnum } from "@/lib/billing";

export default function InvoiceViewActions({
  invoiceId,
  initialStatus,
  invoiceNumber,
  documentType,
}: {
  invoiceId: string;
  initialStatus: "UNPAID" | "PAID";
  invoiceNumber: string;
  documentType?: DocumentTypeEnum;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"UNPAID" | "PAID">(initialStatus);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [includeShipTo, setIncludeShipTo] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteTest = async () => {
    if (!window.confirm(`Are you sure you want to delete test invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Test invoice deleted successfully.");
        router.push("/admin/invoices");
        router.refresh();
      } else {
        alert(data.error || "Failed to delete test invoice.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleShipTo = (checked: boolean) => {
    setIncludeShipTo(checked);
    const consigneeEl = document.getElementById("consigneeCard");
    const buyerPadding = document.getElementById("buyerCardContent");
    if (consigneeEl) {
      consigneeEl.style.display = checked ? "block" : "none";
    }
    if (buyerPadding) {
      buyerPadding.style.padding = checked ? "4px 8px" : "8px 8px";
      buyerPadding.style.minHeight = checked ? "64px" : "130px";
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = status === "PAID" ? "UNPAID" : "PAID";
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert(data.error || "Failed to update payment status.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const isPaid = status === "PAID";

  return (
    <div className={`${styles.actionBar} ${styles.noPrint}`}>
      <Link href="/admin/invoices" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Invoices
      </Link>

      <div className={styles.actionButtons}>
        {/* Status indicator */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.85rem",
            fontWeight: 700,
            padding: "5px 12px",
            borderRadius: "6px",
            backgroundColor: isPaid ? "#E8F5E9" : "#FFF3E0",
            color: isPaid ? "#2E7D32" : "#E65100",
            border: `1px solid ${isPaid ? "#A5D6A7" : "#FFE082"}`,
          }}
        >
          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
          {isPaid ? "PAID (VERIFIED)" : "UNPAID (AWAITING WIRE)"}
        </span>

        {/* Toggle Status Button */}
        <button
          type="button"
          disabled={updating}
          onClick={handleToggleStatus}
          className={styles.statusBtn}
          style={{
            borderColor: isPaid ? "#d97706" : "#059669",
            color: isPaid ? "#d97706" : "#059669",
          }}
        >
          {updating ? "Updating..." : isPaid ? "Mark as Unpaid" : "Verify & Mark as Paid"}
        </button>

        {/* Optional Consignee (Ship to) Print Toggle */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "5px 12px",
            borderRadius: "6px",
            border: "1px solid #dcd7ce",
            background: includeShipTo ? "#f7f5f0" : "#ffffff",
            color: "#3A2F28",
            userSelect: "none",
          }}
          title="Toggle Consignee (Ship to) section on invoice"
        >
          <input
            type="checkbox"
            checked={includeShipTo}
            onChange={(e) => handleToggleShipTo(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <span>Show Consignee (Ship to)</span>
        </label>

        {/* Print / Save as PDF Button */}
        <button type="button" onClick={handlePrint} className={styles.printBtn}>
          <Printer size={16} /> Print / Save as PDF
        </button>

        {/* Optional Delete for Test Invoices */}
        {documentType === "TEST_INVOICE" && (
          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteTest}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "7px 12px",
              borderRadius: "6px",
              border: "1px solid #f87171",
              background: "#fef2f2",
              color: "#b91c1c",
              cursor: "pointer",
            }}
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete Test Invoice"}
          </button>
        )}
      </div>
    </div>
  );
}

