"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_BUSINESS_DETAILS,
  DEFAULT_BANK_DETAILS,
  formatInr,
  DocumentTypeEnum,
} from "@/lib/billing";
import { Plus, Trash2, ArrowLeft, Building2, User, CreditCard, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

interface InitialEnquiryData {
  enquiryId: string;
  enquiryNumber: string;
  customerName: string;
  email: string;
  phone: string;
  location: string;
  items: Array<{
    productNameSnapshot: string;
    productCodeSnapshot: string;
    quantity: number;
  }>;
}

interface FormItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export default function InvoiceCreateForm({
  initialEnquiry,
}: {
  initialEnquiry?: InitialEnquiryData | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document metadata
  const [documentType, setDocumentType] = useState<DocumentTypeEnum>("TAX_INVOICE");
  const [isInterState, setIsInterState] = useState(false);
  const [isReverseCharge, setIsReverseCharge] = useState(false);
  const [placeOfSupply, setPlaceOfSupply] = useState("Rajasthan (08)");
  const [priceMode, setPriceMode] = useState<"EXCLUSIVE" | "INCLUSIVE">("EXCLUSIVE");

  // Customer state
  const [customerName, setCustomerName] = useState(initialEnquiry?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(initialEnquiry?.email || "");
  const [customerPhone, setCustomerPhone] = useState(initialEnquiry?.phone || "");
  const [customerAddress, setCustomerAddress] = useState(initialEnquiry?.location || "");
  const [customerGstin, setCustomerGstin] = useState("");

  // Optional Consignee (Ship to) state
  const [hasSeparateShipTo, setHasSeparateShipTo] = useState(false);
  const [consigneeName, setConsigneeName] = useState("");
  const [consigneePhone, setConsigneePhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Business state (Pre-filled with verified Unique Timber & Handicraft coordinates)
  const [businessName, setBusinessName] = useState(DEFAULT_BUSINESS_DETAILS.businessName);
  const [businessAddress, setBusinessAddress] = useState(DEFAULT_BUSINESS_DETAILS.businessAddress);
  const [businessGstin, setBusinessGstin] = useState(DEFAULT_BUSINESS_DETAILS.businessGstin);
  const [businessPhone, setBusinessPhone] = useState(DEFAULT_BUSINESS_DETAILS.businessPhone);
  const [businessEmail, setBusinessEmail] = useState(DEFAULT_BUSINESS_DETAILS.businessEmail);

  // Bank state (Optional - default to false so invoices do not include bank wire details unless explicitly enabled)
  const [includeBankDetails, setIncludeBankDetails] = useState(false);
  const [bankName, setBankName] = useState(DEFAULT_BANK_DETAILS.bankName);
  const [bankAccountName, setBankAccountName] = useState(DEFAULT_BANK_DETAILS.bankAccountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(DEFAULT_BANK_DETAILS.bankAccountNumber);
  const [bankIfsc, setBankIfsc] = useState(DEFAULT_BANK_DETAILS.bankIfsc);
  const [bankBranch, setBankBranch] = useState(DEFAULT_BANK_DETAILS.bankBranch);

  // Items (HSN left blank until admin enters CA-confirmed classification)
  const [items, setItems] = useState<FormItem[]>(() => {
    if (initialEnquiry && initialEnquiry.items.length > 0) {
      return initialEnquiry.items.map((it, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        description: it.productNameSnapshot || "Solid Wood Furniture",
        hsnCode: "",
        quantity: it.quantity || 1,
        unitPrice: 0,
        gstRate: 18,
      }));
    }
    return [
      {
        id: `item-0-${Date.now()}`,
        description: "Bespoke Handcrafted Solid Sheesham Wood Furniture",
        hsnCode: "",
        quantity: 1,
        unitPrice: 0,
        gstRate: 18,
      },
    ];
  });

  // Shipping & Crating
  const [shippingCharges, setShippingCharges] = useState(0);
  const [shippingGstRate, setShippingGstRate] = useState(18);

  // Notes & Due Date
  const [notes, setNotes] = useState(
    "All pieces are crafted from seasoned solid timber. 100% advance wire required prior to dispatch. Physical inspection upon delivery is recommended."
  );
  const [dueDate, setDueDate] = useState("");

  // Helpers to add/remove items
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${prev.length}-${Date.now()}`,
        description: "",
        hsnCode: "",
        quantity: 1,
        unitPrice: 0,
        gstRate: 18,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: value };
        }
        return it;
      })
    );
  };

  // Calculations for display preview
  let runningSubtotal = 0;
  let runningItemTax = 0;

  items.forEach((it) => {
    const qty = Math.max(1, Number(it.quantity) || 1);
    const price = Math.max(0, Number(it.unitPrice) || 0);
    const rate = Math.max(0, Number(it.gstRate) || 0);

    if (priceMode === "INCLUSIVE" && rate > 0) {
      const gross = qty * price;
      const taxable = gross / (1 + rate / 100);
      const tax = gross - taxable;
      runningSubtotal += taxable;
      runningItemTax += tax;
    } else {
      const taxable = qty * price;
      const tax = taxable * (rate / 100);
      runningSubtotal += taxable;
      runningItemTax += tax;
    }
  });

  const previewShipping = Math.max(0, Number(shippingCharges) || 0);
  const previewShippingTax = previewShipping * (Math.max(0, Number(shippingGstRate) || 0) / 100);
  const previewTotalTax = runningItemTax + previewShippingTax;
  const previewGrandTotal = Math.round(runningSubtotal + previewTotalTax + previewShipping);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client check on basics
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage("Please enter customer name, email and phone number.");
      return;
    }

    if (items.some((it) => !it.description.trim() || it.unitPrice < 0)) {
      setErrorMessage("Please ensure every item has a description and non-negative unit price.");
      return;
    }

    // Rule 46 Proviso validation: Unregistered customer with taxable supply >= ₹50,000
    const isUnregistered = !customerGstin.trim();
    if (isUnregistered && runningSubtotal >= 50000) {
      if (!customerAddress.trim() || customerAddress.trim().length < 5) {
        setErrorMessage(
          "Under GST Rule 46 proviso, for supplies of ₹50,000 or more to an unregistered recipient, the complete billing address is mandatory."
        );
        return;
      }
      if (hasSeparateShipTo && (!shippingAddress.trim() || shippingAddress.trim().length < 5)) {
        setErrorMessage(
          "Under GST Rule 46 proviso, when shipping to a separate location for sales of ₹50,000 or more, the delivery address is mandatory."
        );
        return;
      }
      if (!placeOfSupply.trim()) {
        setErrorMessage(
          "Under GST Rule 46 proviso, for supplies of ₹50,000 or more to an unregistered recipient, Destination State Name and 2-digit State Code are mandatory."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const finalAddress =
        hasSeparateShipTo && shippingAddress.trim()
          ? `Billing Address: ${customerAddress.trim()}\nShipping Address: ${shippingAddress.trim()}${consigneeName.trim() ? ` (Attn: ${consigneeName.trim()})` : ""}${consigneePhone.trim() ? ` [Ph: ${consigneePhone.trim()}]` : ""}`
          : customerAddress.trim();

      const payload = {
        documentType,
        enquiryId: initialEnquiry?.enquiryId || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: finalAddress,
        customerGstin: customerGstin.trim() || null,
        placeOfSupply: placeOfSupply.trim(),
        isInterState,
        isReverseCharge: Boolean(isReverseCharge),
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessGstin: businessGstin.trim(),
        businessPan: null,
        businessPhone: businessPhone.trim(),
        businessEmail: businessEmail.trim(),
        bankName: includeBankDetails && bankName.trim() ? bankName.trim() : null,
        bankAccountName: includeBankDetails && bankAccountName.trim() ? bankAccountName.trim() : null,
        bankAccountNumber: includeBankDetails && bankAccountNumber.trim() ? bankAccountNumber.trim() : null,
        bankIfsc: includeBankDetails && bankIfsc.trim() ? bankIfsc.trim().toUpperCase() : null,
        bankBranch: includeBankDetails && bankBranch.trim() ? bankBranch.trim() : null,
        items: items.map((it) => ({
          description: it.description,
          hsnCode: it.hsnCode || null,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          priceMode,
          gstRate: it.gstRate,
        })),
        shippingCharges: previewShipping,
        shippingGstRate: Number(shippingGstRate) || 0,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      };

      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create invoice.");
      }

      router.push(`/admin/invoices/${data.invoiceId}`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/admin/invoices"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "#666",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            <ArrowLeft size={16} /> Back to Invoices
          </Link>
        </div>
        {initialEnquiry && (
          <span style={{ fontSize: "0.85rem", background: "#f0ede6", padding: "4px 10px", borderRadius: "4px", color: "#3A2F28" }}>
            Linked to Enquiry: <strong>{initialEnquiry.enquiryNumber}</strong>
          </span>
        )}
      </div>

      {errorMessage && (
        <div
          style={{
            background: "#FDECEA",
            color: "#C62828",
            padding: "0.875rem 1.25rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            border: "1px solid #FFCDD2",
            fontSize: "0.9rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* 1. DOCUMENT CONFIGURATION */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem" }}>
          1. Document Type & Place of Supply
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentTypeEnum)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            >
              <option value="TAX_INVOICE">Tax Invoice (Standard GST B2C Sale)</option>
              <option value="BILL_OF_SUPPLY">Bill of Supply (Exempt / Nil Rated)</option>
              <option value="QUOTATION">Quotation (Price Estimate)</option>
              <option value="PROFORMA_INVOICE">Proforma Invoice (Pre-dispatch Wire Request)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Place of Supply (Destination State)
            </label>
            <input
              type="text"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              placeholder="e.g. Rajasthan (08) or Maharashtra (27)"
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            <input
              type="checkbox"
              id="isInterState"
              checked={isInterState}
              onChange={(e) => setIsInterState(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="isInterState" style={{ fontSize: "0.9rem", color: "#333", cursor: "pointer" }}>
              Inter-State Supply (Apply IGST instead of CGST+SGST)
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            <input
              type="checkbox"
              id="isReverseCharge"
              checked={isReverseCharge}
              onChange={(e) => setIsReverseCharge(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="isReverseCharge" style={{ fontSize: "0.9rem", color: "#333", cursor: "pointer" }}>
              Tax Payable on Reverse Charge Basis (RCM)
            </label>
          </div>
        </div>
      </div>

      {/* 2. CUSTOMER DETAILS */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={18} />
          <span>2. Customer Details</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Phone Number *
            </label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Customer GSTIN (Optional)
            </label>
            <input
              type="text"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 08AAAAA0000A1Z5"
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Buyer Billing Address *
            </label>
            <textarea
              rows={2}
              required
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Full customer billing street address, city, state, pincode"
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          {/* Optional Separate Consignee (Ship to) */}
          <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #f0ede8", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "#1a1a1a" }}>
              <input
                type="checkbox"
                checked={hasSeparateShipTo}
                onChange={(e) => setHasSeparateShipTo(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>Ship to a different address / consignee (Optional)</span>
            </label>
            {!hasSeparateShipTo ? (
              <p style={{ fontSize: "0.8rem", color: "#777", margin: "0.25rem 0 0 1.6rem" }}>
                Consignee (Ship to) details will match the Buyer (Bill to) above.
              </p>
            ) : (
              <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Consignee Name</label>
                  <input type="text" value={consigneeName} onChange={(e) => setConsigneeName(e.target.value)} placeholder="Recipient / Contact name at delivery site" style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Consignee Contact / Phone</label>
                  <input type="text" value={consigneePhone} onChange={(e) => setConsigneePhone(e.target.value)} placeholder="Delivery site phone number" style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Consignee Delivery / Shipping Address</label>
                  <textarea rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Separate delivery address, street, city, state, pincode" style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. LINE ITEMS */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={18} />
            <span>3. Products & Pricing</span>
          </h2>

          {/* Pricing Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f8f6f2", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e2ddd5" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#666" }}>Price Mode:</span>
            <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="priceMode"
                value="EXCLUSIVE"
                checked={priceMode === "EXCLUSIVE"}
                onChange={() => setPriceMode("EXCLUSIVE")}
              />
              Exclusive (Add GST on top)
            </label>
            <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="priceMode"
                value="INCLUSIVE"
                checked={priceMode === "INCLUSIVE"}
                onChange={() => setPriceMode("INCLUSIVE")}
              />
              Inclusive (MRP with GST)
            </label>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item, index) => {
            const qty = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.unitPrice) || 0);
            const rate = Math.max(0, Number(item.gstRate) || 0);
            let lineTotal = 0;
            if (priceMode === "INCLUSIVE") {
              lineTotal = qty * price;
            } else {
              lineTotal = qty * price * (1 + rate / 100);
            }

            return (
              <div
                key={item.id}
                style={{
                  background: "#faf9f7",
                  border: "1px solid #e9e4dc",
                  borderRadius: "6px",
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "minmax(250px, 3fr) 90px 80px 110px 100px 110px 40px",
                  gap: "0.75rem",
                  alignItems: "end",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    Item Description / Dimensions *
                  </label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="e.g. Solid Sheesham Coffee Table (Honey Finish)"
                    style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => updateItem(item.id, "hsnCode", e.target.value)}
                    placeholder="e.g. 9403, 4420"
                    style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value, 10) || 1)}
                    style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    {priceMode === "INCLUSIVE" ? "Gross Price (₹)" : "Selling Price (₹)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                    style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    GST %
                  </label>
                  <select
                    value={item.gstRate}
                    onChange={(e) => updateItem(item.id, "gstRate", parseFloat(e.target.value) || 0)}
                    style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.85rem" }}
                  >
                    <option value={0}>0% (Nil)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>
                    Line Total
                  </label>
                  <div style={{ padding: "0.45rem", fontWeight: 600, color: "#1a1a1a", fontSize: "0.85rem" }}>
                    {formatInr(lineTotal)}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    style={{
                      background: "none",
                      border: "none",
                      color: items.length <= 1 ? "#ccc" : "#d32f2f",
                      cursor: items.length <= 1 ? "not-allowed" : "pointer",
                      padding: "6px",
                    }}
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "#faf8f5",
              border: "1px dashed #b5a794",
              color: "#3A2F28",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <Plus size={16} /> Add Product Line
          </button>
        </div>
      </div>

      {/* 4. SHIPPING & CRATING CHARGES */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Truck size={18} />
          <span>4. Shipping, Packaging & Crating Charges</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Crating / Freight Charges (₹)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={shippingCharges}
              onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Shipping GST Rate
            </label>
            <select
              value={shippingGstRate}
              onChange={(e) => setShippingGstRate(parseFloat(e.target.value) || 0)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            >
              <option value={0}>0% (Exempt / Nil Rated)</option>
              <option value={5}>5% (Goods Transport Agency without ITC)</option>
              <option value={12}>12% (Goods Transport Agency with ITC)</option>
              <option value={18}>18% (Composite Supply / Standard Freight & Crating)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem", color: "#444" }}>
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.9rem" }}
            />
          </div>
        </div>
      </div>

      {/* 5. COMPANY BANK DETAILS (OPTIONAL) */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Building2 size={18} />
          <span>5. Company Bank Details (Optional)</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
          Direct bank wire / NEFT / RTGS payment instructions for customer transfer.
        </p>

        <div style={{ padding: "0.85rem", background: includeBankDetails ? "#fcfbfa" : "#faf8f5", border: "1px solid #e2ddd5", borderRadius: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 600, color: "#1a1a1a", fontSize: "0.925rem" }}>
            <input
              type="checkbox"
              checked={includeBankDetails}
              onChange={(e) => setIncludeBankDetails(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span>Include Company Bank Details on this Invoice (Optional)</span>
          </label>

          {!includeBankDetails ? (
            <p style={{ fontSize: "0.8rem", color: "#777", margin: "0.35rem 0 0 1.8rem" }}>
              Bank account and wire transfer details will be omitted from the invoice.
            </p>
          ) : (
            <div style={{ marginTop: "1rem", borderTop: "1px solid #e5e0d8", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#444" }}>Bank Account Coordinates:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBankName(DEFAULT_BANK_DETAILS.bankName);
                    setBankAccountName(DEFAULT_BANK_DETAILS.bankAccountName);
                    setBankAccountNumber(DEFAULT_BANK_DETAILS.bankAccountNumber);
                    setBankIfsc(DEFAULT_BANK_DETAILS.bankIfsc);
                    setBankBranch(DEFAULT_BANK_DETAILS.bankBranch);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8B5A2B",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Reset to Standard SBI Account
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Bank Name</label>
                  <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Account Holder Name</label>
                  <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Account Number</label>
                  <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>IFSC Code</label>
                  <input type="text" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value.toUpperCase())} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.25rem" }}>Branch</label>
                  <input type="text" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.875rem" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. VERIFIED SELLER SNAPSHOT (OPTIONAL CUSTOMIZATION) */}
      <details style={{ background: "#ffffff", border: "1px solid #e5e0d8", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", color: "#1a1a1a" }}>
          Seller Profile Snapshot (Click to view / customize legal business details)
        </summary>
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>Business Legal Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>GSTIN</label>
            <input type="text" value={businessGstin} onChange={(e) => setBusinessGstin(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555" }}>Registered Workshop Address</label>
            <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} style={{ width: "100%", padding: "0.45rem", border: "1px solid #ccc", borderRadius: "4px" }} />
          </div>
        </div>
      </details>

      {/* 7. LIVE SUMMARY & TOTALS */}
      <div style={{ background: "#ffffff", border: "2px solid #1a1a1a", borderRadius: "8px", padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "1rem" }}>
          Summary Preview
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.95rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#666" }}>Taxable Subtotal:</span>
            <strong>{formatInr(runningSubtotal)}</strong>
          </div>
          {isInterState ? (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#1a1a1a" }}>
              <span>Integrated GST (IGST):</span>
              <strong>{formatInr(previewTotalTax)}</strong>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#1a1a1a" }}>
                <span>Central GST (CGST):</span>
                <strong>{formatInr(previewTotalTax / 2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#1a1a1a" }}>
                <span>State GST (SGST):</span>
                <strong>{formatInr(previewTotalTax / 2)}</strong>
              </div>
            </>
          )}
          {previewShipping > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Crating & Freight:</span>
              <strong>{formatInr(previewShipping)}</strong>
            </div>
          )}
          <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "0.5rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a" }}>
            <span>Estimated Grand Total:</span>
            <span>{formatInr(previewGrandTotal)}</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>
            * Final totals and legal consecutive serial numbers are calculated and verified atomically by the server upon submission.
          </p>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <Link
          href="/admin/invoices"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#f0ede6",
            color: "#3A2F28",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "0.75rem 2rem",
            background: submitting ? "#666" : "#1A1A1A",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Issuing Invoice..." : "Issue & View Document →"}
        </button>
      </div>
    </form>
  );
}

