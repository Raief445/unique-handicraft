import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { formatInr, getDocumentTitle, DocumentTypeEnum, numberToIndianRupeesWords } from "@/lib/billing";
import InvoiceViewActions from "@/components/admin/InvoiceViewActions";
import styles from "./invoice.module.css";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface HsnSummaryRow {
  hsnCode: string;
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      items: {
        orderBy: { itemIndex: "asc" },
      },
      enquiry: {
        select: { id: true, enquiryNumber: true },
      },
    },
  });

  if (!invoice) return notFound();

  const docTitle = getDocumentTitle(invoice.documentType as DocumentTypeEnum);
  const isInterState = invoice.isInterState;

  // Format dates in classic Tally date style (e.g. 7-Nov-2026)
  const formatTallyDate = (d: Date | string | null | undefined) => {
    if (!d) return "—";
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "—";
    return dateObj
      .toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(/\s+/g, "-");
  };

  const formattedIssueDate = formatTallyDate(invoice.issueDate);
  const formattedDueDate = formatTallyDate(invoice.dueDate);

  // Extract place of supply state and code
  const placeOfSupplyState = invoice.placeOfSupply
    ? invoice.placeOfSupply.split("(")[0].trim()
    : "Rajasthan";
  const placeOfSupplyCode = invoice.placeOfSupply?.match(/\d+/)?.[0] || "08";

  // Calculate total quantities
  const totalQuantity = invoice.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  // Group HSN/SAC summary (Preserve exact entered HSN without inventing codes)
  const hsnMap = new Map<string, HsnSummaryRow>();

  for (const item of invoice.items) {
    const hsn =
      item.hsnCode && item.hsnCode.trim() && item.hsnCode !== "-"
        ? item.hsnCode.trim()
        : "—";
    const rate = Number(item.gstRate) || 0;
    const key = `${hsn}_${rate}`;
    const taxable = Number(item.taxableAmount) || 0;
    const tax = Number(item.taxAmount) || 0;

    if (!hsnMap.has(key)) {
      hsnMap.set(key, {
        hsnCode: hsn,
        taxableAmount: 0,
        gstRate: rate,
        cgstRate: isInterState ? 0 : rate / 2,
        cgstAmount: 0,
        sgstRate: isInterState ? 0 : rate / 2,
        sgstAmount: 0,
        igstRate: isInterState ? rate : 0,
        igstAmount: 0,
        totalTax: 0,
      });
    }

    const row = hsnMap.get(key)!;
    row.taxableAmount += taxable;
    row.totalTax += tax;
    if (isInterState) {
      row.igstAmount += tax;
    } else {
      row.cgstAmount += tax / 2;
      row.sgstAmount += tax / 2;
    }
  }

  // Add Shipping / Freight if applicable
  const shippingCharges = Number(invoice.shippingCharges) || 0;
  if (shippingCharges > 0) {
    const shipRate = Number(invoice.shippingGstRate) || 0;
    const shipTax = Number(invoice.shippingTaxAmount) || 0;
    const key = `9965_${shipRate}`;
    hsnMap.set(key, {
      hsnCode: "9965 (Freight)",
      taxableAmount: shippingCharges,
      gstRate: shipRate,
      cgstRate: isInterState ? 0 : shipRate / 2,
      cgstAmount: isInterState ? 0 : shipTax / 2,
      sgstRate: isInterState ? 0 : shipRate / 2,
      sgstAmount: isInterState ? 0 : shipTax / 2,
      igstRate: isInterState ? shipRate : 0,
      igstAmount: isInterState ? shipTax : 0,
      totalTax: shipTax,
    });
  }

  const hsnRows = Array.from(hsnMap.values());
  const totalTaxable = hsnRows.reduce((sum, r) => sum + r.taxableAmount, 0);
  const totalCgst = hsnRows.reduce((sum, r) => sum + r.cgstAmount, 0);
  const totalSgst = hsnRows.reduce((sum, r) => sum + r.sgstAmount, 0);
  const totalIgst = hsnRows.reduce((sum, r) => sum + r.igstAmount, 0);
  const totalTaxCalculated = hsnRows.reduce((sum, r) => sum + r.totalTax, 0);

  // Consignee (Ship to) & Buyer (Bill to) parsing
  let shipToAddress = invoice.customerAddress || "B2C Customer Doorstep Delivery / Counter Handover";
  let billToAddress = invoice.customerAddress || "B2C Customer Doorstep Delivery / Counter Handover";
  let consigneeName = invoice.customerName;

  if (invoice.customerAddress && invoice.customerAddress.includes("Shipping Address:")) {
    const parts = invoice.customerAddress.split("Shipping Address:");
    billToAddress = parts[0].replace(/^Billing Address:\s*/i, "").replace(/^Billing:\s*/i, "").trim() || billToAddress;
    shipToAddress = parts[1].trim() || shipToAddress;
    const attnMatch = shipToAddress.match(/\(Attn:\s*([^)]+)\)/i);
    if (attnMatch) {
      consigneeName = attnMatch[1].trim();
      shipToAddress = shipToAddress.replace(/\(Attn:\s*[^)]+\)/i, "").trim();
    }
  }

  const hasBankDetails = Boolean(invoice.bankAccountNumber || invoice.bankName);

  return (
    <div className={styles.container}>
      {/* Interactive Action Bar (Hidden during print) */}
      <InvoiceViewActions
        invoiceId={invoice.id}
        initialStatus={invoice.paymentStatus as any}
        invoiceNumber={invoice.invoiceNumber}
      />

      {/* The Printable A4 Sheet - Tally Prime Goods Format */}
      <div className={styles.invoiceSheet}>
        <div className={styles.tallyBox}>
          {/* 1. Blue Header Bar with Rule 48 Statutory Marking */}
          <div className={styles.titleBar}>
            <div style={{ fontSize: "12pt", fontWeight: 700 }}>{docTitle}</div>
            <div style={{ fontSize: "7.5pt", fontWeight: 600, letterSpacing: "0.5px" }}>
              (ORIGINAL FOR RECIPIENT)
            </div>
          </div>

          {/* 2. Top Section: Company Coordinates (Left 50%) & Invoice Metadata (Right 50%) */}
          <table className={styles.gridTable}>
            <tbody>
              <tr>
                {/* Company Details */}
                <td className={styles.cell} style={{ width: "50%", padding: "6px 8px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, width: "110px", marginTop: "2px" }}>
                      <Image
                        src="/logo.png"
                        alt="Unique Timber & Handicraft"
                        width={110}
                        height={40}
                        style={{ objectFit: "contain", maxHeight: "45px", width: "100%" }}
                        priority
                      />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div className={styles.companyTitle}>{invoice.businessName}</div>
                      <div style={{ fontSize: "8pt", color: "#333", lineHeight: 1.35, marginBottom: "3px" }}>
                        {invoice.businessAddress}
                      </div>
                      <div style={{ fontSize: "8pt", lineHeight: 1.35 }}>
                        <div>
                          <strong>GSTIN/UIN:</strong> {invoice.businessGstin || "—"}
                        </div>
                        <div>
                          <strong>State Name:</strong> Rajasthan, <strong>Code:</strong> 08
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Invoice Metadata Subgrid */}
                <td style={{ width: "50%", padding: 0, verticalAlign: "top" }}>
                  <table className={styles.gridTable} style={{ height: "100%" }}>
                    <tbody>
                      <tr>
                        <td className={styles.cell} style={{ width: "50%" }}>
                          <span className={styles.labelMuted}>Invoice No.</span>
                          <div className={styles.valBold} style={{ fontSize: "9.5pt" }}>{invoice.invoiceNumber}</div>
                        </td>
                        <td className={styles.cell} style={{ width: "50%" }}>
                          <span className={styles.labelMuted}>Dated</span>
                          <div className={styles.valBold}>{formattedIssueDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Delivery Note</span>
                          <div>—</div>
                        </td>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Mode/Terms of Payment</span>
                          <div className={styles.valBold}>
                            Direct Bank Transfer
                            <span
                              style={{
                                display: "inline-block",
                                marginLeft: "4px",
                                fontSize: "7.5pt",
                                padding: "1px 4px",
                                borderRadius: "3px",
                                background: invoice.paymentStatus === "PAID" ? "#e6f4ea" : "#fff0e6",
                                color: invoice.paymentStatus === "PAID" ? "#137333" : "#c5221f",
                                border: `1px solid ${invoice.paymentStatus === "PAID" ? "#b7e1cd" : "#fad2cf"}`,
                              }}
                            >
                              {invoice.paymentStatus === "PAID" ? "PAID" : "UNPAID"}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Reference No. & Date.</span>
                          <div>{invoice.enquiry?.enquiryNumber || "—"}</div>
                        </td>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Other References</span>
                          <div>—</div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Buyer&apos;s Order No.</span>
                          <div>—</div>
                        </td>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Dated</span>
                          <div>{formattedDueDate}</div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell} colSpan={2} style={{ padding: "3px 6px", background: "#fafafa" }}>
                          <span className={styles.labelMuted}>Whether tax is payable on reverse charge basis: </span>
                          <span className={styles.valBold}>{invoice.isReverseCharge ? "YES" : "NO"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 3. Consignee (Ship to), Buyer (Bill to) & Dispatch Details */}
          <table className={styles.gridTable} style={{ borderTop: "1px solid #000" }}>
            <tbody>
              <tr>
                {/* Consignee & Buyer (Left 50%) */}
                <td style={{ width: "50%", padding: 0, verticalAlign: "top", borderRight: "1px solid #000" }}>
                  {/* Consignee (Ship to) - Optional toggle */}
                  <div id="consigneeCard" style={{ display: "block" }}>
                    <div className={styles.cellHeaderYellow}>Consignee (Ship to)</div>
                    <div style={{ padding: "4px 8px", fontSize: "8.5pt", minHeight: "64px", borderBottom: "1px solid #000", lineHeight: 1.4 }}>
                      <div className={styles.valBold} style={{ fontSize: "9pt", marginBottom: "1px" }}>
                        {consigneeName}
                      </div>
                      <div style={{ color: "#333", margin: "1px 0 2px 0" }}>
                        {shipToAddress}
                      </div>
                      <div>
                        <strong>GSTIN/UIN:</strong> {invoice.customerGstin || "Unregistered / Consumer"}
                      </div>
                      <div>
                        <strong>State Name:</strong> {placeOfSupplyState}, <strong>Code:</strong> {placeOfSupplyCode}
                      </div>
                      <div>
                        <strong>Place of Supply:</strong> {placeOfSupplyState} ({placeOfSupplyCode})
                        {isInterState && (
                          <span style={{ marginLeft: "4px", fontWeight: 700, color: "#003366" }}>
                            [Inter-State Supply / IGST]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buyer (Bill to) */}
                  <div id="buyerCard">
                    <div className={styles.cellHeaderYellow}>Buyer (Bill to)</div>
                    <div id="buyerCardContent" style={{ padding: "4px 8px", fontSize: "8.5pt", minHeight: "64px", lineHeight: 1.4 }}>
                      <div className={styles.valBold} style={{ fontSize: "9pt", marginBottom: "1px" }}>
                        {invoice.customerName}
                      </div>
                      <div style={{ color: "#333", margin: "1px 0 2px 0" }}>
                        {billToAddress}
                      </div>
                      <div>
                        <strong>Contact:</strong> {invoice.customerPhone} &bull; <strong>Email:</strong> {invoice.customerEmail}
                      </div>
                      <div>
                        <strong>GSTIN/UIN:</strong> {invoice.customerGstin || "Unregistered / Consumer"}
                      </div>
                      <div>
                        <strong>State Name:</strong> {placeOfSupplyState}, <strong>Code:</strong> {placeOfSupplyCode}
                      </div>
                      <div>
                        <strong>Place of Supply:</strong> {placeOfSupplyState} ({placeOfSupplyCode})
                        {isInterState && (
                          <span style={{ marginLeft: "4px", fontWeight: 700, color: "#003366" }}>
                            [Inter-State Supply / IGST]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Dispatch Coordinates (Right 50%) */}
                <td style={{ width: "50%", padding: 0, verticalAlign: "top" }}>
                  <table className={styles.gridTable} style={{ height: "100%" }}>
                    <tbody>
                      <tr>
                        <td className={styles.cell} style={{ width: "50%" }}>
                          <span className={styles.labelMuted}>Dispatch Doc No.</span>
                          <div>—</div>
                        </td>
                        <td className={styles.cell} style={{ width: "50%" }}>
                          <span className={styles.labelMuted}>Delivery Note Date</span>
                          <div>—</div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Dispatched through</span>
                          <div>Road Transport / Cargo</div>
                        </td>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Place of Supply (State & Code)</span>
                          <div className={styles.valBold} style={{ color: isInterState ? "#003366" : "#000" }}>
                            {placeOfSupplyState} ({placeOfSupplyCode})
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Bill of Lading/LR-RR No.</span>
                          <div>—</div>
                        </td>
                        <td className={styles.cell}>
                          <span className={styles.labelMuted}>Motor Vehicle No.</span>
                          <div>—</div>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.cell} colSpan={2} style={{ height: "58px" }}>
                          <span className={styles.labelMuted}>Terms of Delivery</span>
                          <div style={{ fontSize: "8pt", color: "#333", lineHeight: 1.35, marginTop: "2px" }}>
                            Handcrafted natural timber goods. Delivery upon full bank wire realization. Subject to Jodhpur jurisdiction.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 4. Main Item Table (Goods Format) */}
          <table className={styles.gridTable} style={{ borderTop: "1px solid #000" }}>
            <thead>
              <tr>
                <th className={styles.thYellow} style={{ width: "5%" }}>Sl. No.</th>
                <th className={styles.thYellow} style={{ width: "43%", textAlign: "left" }}>Description of Goods</th>
                <th className={styles.thYellow} style={{ width: "11%" }}>HSN/SAC</th>
                <th className={styles.thYellow} style={{ width: "10%", textAlign: "right" }}>Quantity</th>
                <th className={styles.thYellow} style={{ width: "12%", textAlign: "right" }}>Rate</th>
                <th className={styles.thYellow} style={{ width: "6%" }}>per</th>
                <th className={styles.thYellow} style={{ width: "13%", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Line items */}
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className={styles.itemRow}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>
                    <div className={styles.valBold}>{item.description}</div>
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "monospace" }}>{item.hsnCode || "—"}</td>
                  <td style={{ textAlign: "right" }}>{item.quantity} Nos</td>
                  <td style={{ textAlign: "right" }}>{formatInr(item.unitPrice).replace("₹", "").trim()}</td>
                  <td style={{ textAlign: "center" }}>Nos</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatInr(item.taxableAmount).replace("₹", "").trim()}
                  </td>
                </tr>
              ))}

              {/* Tally Intra-State / Inter-State Tax Lines inside the items table */}
              {!isInterState ? (
                <>
                  {Number(invoice.cgstAmount) > 0 && (
                    <tr className={styles.taxSubRow}>
                      <td style={{ textAlign: "center" }}></td>
                      <td style={{ textAlign: "right", fontStyle: "italic" }}>
                        Central GST (CGST)
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>
                        {formatInr(invoice.cgstAmount).replace("₹", "").trim()}
                      </td>
                    </tr>
                  )}
                  {Number(invoice.sgstAmount) > 0 && (
                    <tr className={styles.taxSubRow}>
                      <td style={{ textAlign: "center" }}></td>
                      <td style={{ textAlign: "right", fontStyle: "italic" }}>
                        State GST (SGST)
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>
                        {formatInr(invoice.sgstAmount).replace("₹", "").trim()}
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <>
                  {Number(invoice.igstAmount) > 0 && (
                    <tr className={styles.taxSubRow}>
                      <td style={{ textAlign: "center" }}></td>
                      <td style={{ textAlign: "right", fontStyle: "italic" }}>
                        Integrated GST (IGST)
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>
                        {formatInr(invoice.igstAmount).replace("₹", "").trim()}
                      </td>
                    </tr>
                  )}
                </>
              )}

              {/* Crating, Packaging & Freight */}
              {Number(invoice.shippingCharges) > 0 && (
                <tr className={styles.taxSubRow}>
                  <td style={{ textAlign: "center" }}></td>
                  <td style={{ textAlign: "right", fontStyle: "italic" }}>
                    Crating, Packaging & Freight Charges
                    {Number(invoice.shippingGstRate) > 0 && (
                      <span style={{ fontSize: "7.5pt", color: "#555" }}> ({Number(invoice.shippingGstRate)}% GST)</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontFamily: "monospace" }}>9965</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: "right" }}>
                    {formatInr(Number(invoice.shippingCharges)).replace("₹", "").trim()}
                  </td>
                </tr>
              )}

              {/* Round Off */}
              {Number(invoice.roundOffAmount) !== 0 && (
                <tr className={styles.taxSubRow}>
                  <td style={{ textAlign: "center" }}></td>
                  <td style={{ textAlign: "right", fontStyle: "italic" }}>Round Off</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: "right" }}>
                    {formatInr(invoice.roundOffAmount).replace("₹", "").trim()}
                  </td>
                </tr>
              )}

              {/* Spacing filler row to maintain visual balance */}
              <tr className={styles.taxSubRow} style={{ height: "24px" }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {/* Total Row */}
              <tr className={styles.itemTotalRow}>
                <td colSpan={2} style={{ textAlign: "right" }}>Total</td>
                <td></td>
                <td style={{ textAlign: "right" }}>{totalQuantity} Nos</td>
                <td></td>
                <td></td>
                <td style={{ textAlign: "right" }}>{formatInr(invoice.grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          {/* 5. Amount Chargeable (in words) */}
          <table className={styles.gridTable}>
            <tbody>
              <tr>
                <td className={styles.cell} style={{ width: "75%", padding: "5px 6px" }}>
                  <div className={styles.labelMuted}>Amount Chargeable (in words)</div>
                  <div className={styles.valBold} style={{ fontSize: "9pt", marginTop: "2px" }}>
                    {numberToIndianRupeesWords(invoice.grandTotal)}
                  </div>
                </td>
                <td className={styles.cell} style={{ width: "25%", textAlign: "right", verticalAlign: "middle", padding: "5px 8px" }}>
                  <span className={styles.valBold} style={{ fontSize: "8.5pt", color: "#555" }}>E. & O.E.</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 6. GST Summary Table Grouped by HSN/SAC */}
          <table className={styles.hsnTable} style={{ borderTop: "1px solid #000" }}>
            <thead>
              {!isInterState ? (
                <>
                  <tr>
                    <th rowSpan={2} style={{ width: "18%" }}>HSN/SAC</th>
                    <th rowSpan={2} style={{ width: "18%" }}>Taxable Value (₹)</th>
                    <th colSpan={2} style={{ width: "24%" }}>CGST</th>
                    <th colSpan={2} style={{ width: "24%" }}>SGST</th>
                    <th rowSpan={2} style={{ width: "16%" }}>Total Tax Amount (₹)</th>
                  </tr>
                  <tr>
                    <th style={{ width: "10%" }}>Rate</th>
                    <th style={{ width: "14%" }}>Amount</th>
                    <th style={{ width: "10%" }}>Rate</th>
                    <th style={{ width: "14%" }}>Amount</th>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <th rowSpan={2} style={{ width: "25%" }}>HSN/SAC</th>
                    <th rowSpan={2} style={{ width: "25%" }}>Taxable Value (₹)</th>
                    <th colSpan={2} style={{ width: "30%" }}>IGST</th>
                    <th rowSpan={2} style={{ width: "20%" }}>Total Tax Amount (₹)</th>
                  </tr>
                  <tr>
                    <th style={{ width: "12%" }}>Rate</th>
                    <th style={{ width: "18%" }}>Amount</th>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {hsnRows.map((h, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "center", fontFamily: "monospace" }}>{h.hsnCode}</td>
                  <td style={{ textAlign: "right" }}>{formatInr(h.taxableAmount).replace("₹", "").trim()}</td>
                  {!isInterState ? (
                    <>
                      <td style={{ textAlign: "center" }}>{h.cgstRate}%</td>
                      <td style={{ textAlign: "right" }}>{formatInr(h.cgstAmount).replace("₹", "").trim()}</td>
                      <td style={{ textAlign: "center" }}>{h.sgstRate}%</td>
                      <td style={{ textAlign: "right" }}>{formatInr(h.sgstAmount).replace("₹", "").trim()}</td>
                    </>
                  ) : (
                    <>
                      <td style={{ textAlign: "center" }}>{h.igstRate}%</td>
                      <td style={{ textAlign: "right" }}>{formatInr(h.igstAmount).replace("₹", "").trim()}</td>
                    </>
                  )}
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatInr(h.totalTax).replace("₹", "").trim()}
                  </td>
                </tr>
              ))}
              {/* Summary Total Row */}
              <tr style={{ fontWeight: 700, background: "#fafafa" }}>
                <td style={{ textAlign: "right" }}>Total</td>
                <td style={{ textAlign: "right" }}>{formatInr(totalTaxable).replace("₹", "").trim()}</td>
                {!isInterState ? (
                  <>
                    <td></td>
                    <td style={{ textAlign: "right" }}>{formatInr(totalCgst).replace("₹", "").trim()}</td>
                    <td></td>
                    <td style={{ textAlign: "right" }}>{formatInr(totalSgst).replace("₹", "").trim()}</td>
                  </>
                ) : (
                  <>
                    <td></td>
                    <td style={{ textAlign: "right" }}>{formatInr(totalIgst).replace("₹", "").trim()}</td>
                  </>
                )}
                <td style={{ textAlign: "right" }}>{formatInr(totalTaxCalculated).replace("₹", "").trim()}</td>
              </tr>
            </tbody>
          </table>

          {/* 7. Tax Amount in Words */}
          <table className={styles.gridTable} style={{ borderTop: "1px solid #000" }}>
            <tbody>
              <tr>
                <td className={styles.cell} style={{ padding: "5px 6px" }}>
                  <span className={styles.labelMuted}>Tax Amount (in words): </span>
                  <span className={styles.valBold}>{numberToIndianRupeesWords(invoice.totalTaxAmount)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 8. Bank Coordinates (Optional) & Declaration + Signatures */}
          <table className={styles.gridTable} style={{ borderTop: "1px solid #000" }}>
            <tbody>
              <tr>
                {/* Left: Bank Details & Declaration */}
                <td className={styles.cell} style={{ width: "55%", padding: "6px" }}>
                  {hasBankDetails && (
                    <div style={{ marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px dashed #ccc" }}>
                      <div className={styles.valBold} style={{ fontSize: "8.5pt", marginBottom: "2px" }}>
                        Company&apos;s Bank Details:
                      </div>
                      <div style={{ fontSize: "8pt", lineHeight: 1.35 }}>
                        <div><strong>Bank Name:</strong> {invoice.bankName}</div>
                        <div><strong>A/c Holder:</strong> {invoice.bankAccountName || invoice.businessName}</div>
                        <div>
                          <strong>A/c No.:</strong>{" "}
                          <span style={{ fontFamily: "monospace", letterSpacing: "1px", fontWeight: 700 }}>
                            {invoice.bankAccountNumber}
                          </span>
                        </div>
                        <div>
                          <strong>Branch & IFS Code:</strong> {invoice.bankBranch || "Basni"} &bull;{" "}
                          <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{invoice.bankIfsc}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className={styles.valBold} style={{ fontSize: "8pt", textTransform: "uppercase" }}>Declaration</div>
                    <div style={{ fontSize: "7.5pt", color: "#333", lineHeight: 1.35, marginTop: "2px" }}>
                      We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                    </div>
                    <div style={{ marginTop: "24px", fontSize: "8pt", color: "#333" }}>
                      Customer&apos;s Seal and Signature
                    </div>
                  </div>
                </td>

                {/* Right: Customer & Authorized Signatory */}
                <td className={styles.cell} style={{ width: "45%", padding: "6px", verticalAlign: "top" }}>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: "120px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "8pt" }}>for <strong>{invoice.businessName}</strong></div>
                    </div>

                    <div style={{ textAlign: "right", marginTop: "35px" }}>
                      <div style={{ fontSize: "7pt", color: "#555", marginBottom: "3px" }}>
                        Computer Generated Document
                      </div>
                      <div className={styles.valBold} style={{ fontSize: "8pt", borderTop: "1px solid #000", display: "inline-block", paddingTop: "2px", minWidth: "140px", textAlign: "center" }}>
                        Authorised Signatory
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 9. Bottom Notice */}
        <div className={styles.jurisdictionNotice}>
          SUBJECT TO JODHPUR JURISDICTION &bull; Computer Generated Tax Invoice issued under Rule 46 of CGST Rules, 2017
        </div>
      </div>
    </div>
  );
}
