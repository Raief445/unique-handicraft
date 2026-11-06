"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import styles from "@/app/admin/invoices/[id]/invoice.module.css";

export default function InvoiceViewActions({
  invoiceId,
  initialStatus,
  invoiceNumber,
}: {
  invoiceId: string;
  initialStatus: "UNPAID" | "PAID";
  invoiceNumber: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"UNPAID" | "PAID">(initialStatus);
  const [updating, setUpdating] = useState(false);

  const handlePrint = () => {
    window.print();
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

        {/* Print / Save as PDF Button */}
        <button type="button" onClick={handlePrint} className={styles.printBtn}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

