"use client";

import { useState } from "react";
import Link from "next/link";
import { formatInr, getDocumentTitle, DocumentTypeEnum } from "@/lib/billing";
import { Eye, Printer, CheckCircle, Clock, Search, Filter, Receipt, Trash2 } from "lucide-react";

export interface SerializedInvoice {
  id: string;
  invoiceNumber: string;
  documentType: DocumentTypeEnum;
  financialYear: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  placeOfSupply: string | null;
  issueDate: string;
  grandTotal: number;
  paymentStatus: "UNPAID" | "PAID";
  paidAt: string | null;
  enquiryId: string | null;
  enquiryNumber?: string | null;
}

export default function InvoiceListTable({
  initialInvoices,
}: {
  initialInvoices: SerializedInvoice[];
}) {
  const [invoices, setInvoices] = useState<SerializedInvoice[]>(initialInvoices);
  const [sectionTab, setSectionTab] = useState<"OFFICIAL" | "TEST" | "ALL">("OFFICIAL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toggle payment status
  const handleToggleStatus = async (invoiceId: string, currentStatus: "UNPAID" | "PAID") => {
    const newStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
    setUpdatingId(invoiceId);

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, paymentStatus: newStatus, paidAt: data.paidAt }
              : inv
          )
        );
      } else {
        alert(data.error || "Failed to update payment status.");
      }
    } catch (err: any) {
      alert("Error updating payment status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Delete single test invoice
  const handleDeleteTestInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete test invoice ${invoiceNumber}? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      } else {
        alert(data.error || "Failed to delete test invoice.");
      }
    } catch (err: any) {
      alert("Error deleting test invoice: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all test invoices
  const handleClearAllTests = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${testInvoices.length} test invoice(s)? This will also reset the test sequence counter back to 0.`
      )
    ) {
      return;
    }
    setClearingAll(true);
    try {
      const res = await fetch("/api/admin/invoices/test", {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInvoices((prev) => prev.filter((inv) => inv.documentType !== "TEST_INVOICE"));
      } else {
        alert(data.error || "Failed to clear test invoices.");
      }
    } catch (err: any) {
      alert("Error clearing test invoices: " + err.message);
    } finally {
      setClearingAll(false);
    }
  };

  // Filtered invoices
  const filtered = invoices.filter((inv) => {
    const isTest = inv.documentType === "TEST_INVOICE";
    if (sectionTab === "OFFICIAL" && isTest) return false;
    if (sectionTab === "TEST" && !isTest) return false;

    const matchesStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || inv.documentType === typeFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerEmail.toLowerCase().includes(q) ||
      inv.customerPhone.toLowerCase().includes(q);

    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate quick metrics (distinguishing official ledger from sandbox tests)
  const officialInvoices = invoices.filter((i) => i.documentType !== "TEST_INVOICE");
  const testInvoices = invoices.filter((i) => i.documentType === "TEST_INVOICE");

  const totalInvoices = officialInvoices.length;
  const unpaidCount = officialInvoices.filter((i) => i.paymentStatus === "UNPAID").length;
  const paidCount = officialInvoices.filter((i) => i.paymentStatus === "PAID").length;
  const unpaidAmount = officialInvoices
    .filter((i) => i.paymentStatus === "UNPAID")
    .reduce((sum, i) => sum + i.grandTotal, 0);
  const paidAmount = officialInvoices
    .filter((i) => i.paymentStatus === "PAID")
    .reduce((sum, i) => sum + i.grandTotal, 0);

  return (
    <div>
      {/* 1. METRICS OVERVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#666", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>
            Total Invoices
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a1a" }}>{totalInvoices}</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>
            Unpaid Invoices ({unpaidCount})
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#b45309" }}>{formatInr(unpaidAmount)}</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>
            Collected Payments ({paidCount})
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#047857" }}>{formatInr(paidAmount)}</div>
        </div>
      </div>

      {/* 2. SECTION TABS (Official vs Test Sandbox) */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", borderBottom: "2px solid #e5e0d8", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setSectionTab("OFFICIAL")}
          style={{
            padding: "0.5rem 1.15rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: sectionTab === "OFFICIAL" ? "#1A1A1A" : "#f5f3ef",
            color: sectionTab === "OFFICIAL" ? "#FFFFFF" : "#555",
            transition: "all 0.15s ease",
          }}
        >
          Official Invoices ({officialInvoices.length})
        </button>
        <button
          type="button"
          onClick={() => setSectionTab("TEST")}
          style={{
            padding: "0.5rem 1.15rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: sectionTab === "TEST" ? "#D97706" : "#fef3c7",
            color: sectionTab === "TEST" ? "#FFFFFF" : "#92400e",
            transition: "all 0.15s ease",
          }}
        >
          🧪 Test Invoices ({testInvoices.length})
        </button>
        <button
          type="button"
          onClick={() => setSectionTab("ALL")}
          style={{
            padding: "0.5rem 1.15rem",
            fontSize: "0.88rem",
            fontWeight: 600,
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background: sectionTab === "ALL" ? "#3A2F28" : "#f5f3ef",
            color: sectionTab === "ALL" ? "#FFFFFF" : "#555",
            transition: "all 0.15s ease",
          }}
        >
          All Records ({invoices.length})
        </button>

        {sectionTab === "TEST" && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/admin/invoices/new?test=true"
              style={{
                padding: "0.45rem 0.95rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                borderRadius: "6px",
                border: "1px solid #d97706",
                background: "#fef3c7",
                color: "#92400e",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              + New Test Bill
            </Link>
            {testInvoices.length > 0 && (
              <button
                type="button"
                disabled={clearingAll}
                onClick={handleClearAllTests}
                style={{
                  padding: "0.45rem 1rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "1px solid #f87171",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  cursor: clearingAll ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Trash2 size={14} />
                {clearingAll ? "Clearing..." : "Clear All Test Invoices"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e0d8",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 300px" }}>
          <Search size={18} color="#888" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "#f5f3ef", padding: "3px", borderRadius: "6px" }}>
            {(["ALL", "UNPAID", "PAID"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  background: statusFilter === st ? "#1a1a1a" : "transparent",
                  color: statusFilter === st ? "#ffffff" : "#555",
                }}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "0.45rem 0.75rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "0.85rem",
              background: "#fff",
            }}
          >
            <option value="ALL">All Document Types</option>
            <option value="TAX_INVOICE">Tax Invoices</option>
            <option value="BILL_OF_SUPPLY">Bills of Supply</option>
            <option value="QUOTATION">Quotations</option>
            <option value="PROFORMA_INVOICE">Proforma Invoices</option>
            <option value="TEST_INVOICE">Test Invoices</option>
          </select>
        </div>
      </div>

      {/* 3. INVOICES TABLE */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#faf8f5", borderBottom: "1px solid #e5e0d8" }}>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Invoice #</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Type</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Date</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Customer</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Grand Total</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28" }}>Payment Status</th>
              <th style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#3A2F28", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#888" }}>
                  No invoices found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const isPaid = inv.paymentStatus === "PAID";
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f0ede8" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>
                      <Link
                        href={`/admin/invoices/${inv.id}`}
                        style={{ color: "#1a1a1a", textDecoration: "none" }}
                      >
                        {inv.invoiceNumber}
                      </Link>
                      {inv.enquiryNumber && (
                        <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>
                          Ref: {inv.enquiryNumber}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: inv.documentType === "TEST_INVOICE" ? "#FEF3C7" : "#f0ede6",
                          color: inv.documentType === "TEST_INVOICE" ? "#92400E" : "#3A2F28",
                          border: inv.documentType === "TEST_INVOICE" ? "1px solid #F59E0B" : "none",
                        }}
                      >
                        {inv.documentType === "TEST_INVOICE" ? "🧪 Test Invoice" : getDocumentTitle(inv.documentType)}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "#666", whiteSpace: "nowrap" }}>
                      {new Date(inv.issueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{inv.customerName}</div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        {inv.customerPhone} &bull; {inv.customerEmail}
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap" }}>
                      {formatInr(inv.grandTotal)}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: isPaid ? "#E8F5E9" : "#FFF3E0",
                          color: isPaid ? "#2E7D32" : "#E65100",
                        }}
                      >
                        {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {isPaid ? "PAID" : "UNPAID"}
                      </span>
                      {isPaid && inv.paidAt && (
                        <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "2px" }}>
                          {new Date(inv.paidAt).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.35rem 0.65rem",
                            background: "#f0ede6",
                            color: "#3A2F28",
                            borderRadius: "4px",
                            textDecoration: "none",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                          title="View and Print"
                        >
                          <Eye size={13} /> View / Print
                        </Link>

                        <button
                          type="button"
                          disabled={updatingId === inv.id}
                          onClick={() => handleToggleStatus(inv.id, inv.paymentStatus)}
                          style={{
                            padding: "0.35rem 0.65rem",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            borderRadius: "4px",
                            border: "1px solid",
                            borderColor: isPaid ? "#d97706" : "#059669",
                            background: "transparent",
                            color: isPaid ? "#d97706" : "#059669",
                            cursor: updatingId === inv.id ? "not-allowed" : "pointer",
                          }}
                          title={isPaid ? "Mark as Unpaid" : "Verify and mark as Paid"}
                        >
                          {updatingId === inv.id ? "..." : isPaid ? "Mark Unpaid" : "Mark Paid"}
                        </button>

                        {inv.documentType === "TEST_INVOICE" && (
                          <button
                            type="button"
                            disabled={deletingId === inv.id}
                            onClick={() => handleDeleteTestInvoice(inv.id, inv.invoiceNumber)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              padding: "0.35rem 0.55rem",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              borderRadius: "4px",
                              border: "1px solid #f87171",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              cursor: deletingId === inv.id ? "not-allowed" : "pointer",
                            }}
                            title="Delete Test Invoice"
                          >
                            <Trash2 size={13} />
                            {deletingId === inv.id ? "..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

