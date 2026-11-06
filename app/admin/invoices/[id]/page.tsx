import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { formatInr, getDocumentTitle, DocumentTypeEnum } from "@/lib/billing";
import InvoiceViewActions from "@/components/admin/InvoiceViewActions";
import styles from "./invoice.module.css";

export const dynamic = "force-dynamic";

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

  const formattedIssueDate = new Date(invoice.issueDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const docTitle = getDocumentTitle(invoice.documentType as DocumentTypeEnum);
  const isInterState = invoice.isInterState;

  return (
    <div className={styles.container}>
      {/* Interactive Action Bar (Hidden during print) */}
      <InvoiceViewActions
        invoiceId={invoice.id}
        initialStatus={invoice.paymentStatus as any}
        invoiceNumber={invoice.invoiceNumber}
      />

      {/* The Printable A4 Sheet */}
      <div className={styles.invoiceSheet}>
        {/* Header */}
        <div className={styles.sheetHeader}>
          <div>
            <h1 className={styles.brandName}>{invoice.businessName}</h1>
            <div className={styles.brandTagline}>Handcrafted Solid Wood Furniture & Handicrafts</div>
            <div className={styles.sellerDetails}>
              <div>{invoice.businessAddress}</div>
              <div>
                <strong>Email:</strong> {invoice.businessEmail} &bull; <strong>Phone:</strong> {invoice.businessPhone}
              </div>
              {invoice.businessGstin && (
                <div>
                  <strong>GSTIN:</strong> {invoice.businessGstin}
                  {invoice.businessPan && <span> &bull; <strong>PAN:</strong> {invoice.businessPan}</span>}
                </div>
              )}
            </div>
          </div>

          <div className={styles.docMeta}>
            <div className={styles.docTitle}>{docTitle}</div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Document #:</span>
              <span className={styles.metaValue}>{invoice.invoiceNumber}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Date of Issue:</span>
              <span className={styles.metaValue}>{formattedIssueDate}</span>
            </div>
            {formattedDueDate && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Due Date:</span>
                <span className={styles.metaValue}>{formattedDueDate}</span>
              </div>
            )}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Place of Supply:</span>
              <span className={styles.metaValue}>{invoice.placeOfSupply || "Rajasthan (08)"}</span>
            </div>
            {invoice.enquiry && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Enquiry Ref:</span>
                <span className={styles.metaValue}>{invoice.enquiry.enquiryNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer / Bill To Details */}
        <div className={styles.billingSection}>
          <div>
            <div className={styles.sectionHeading}>Billed To / Customer Details</div>
            <div className={styles.customerName}>{invoice.customerName}</div>
            {invoice.customerAddress && <div>{invoice.customerAddress}</div>}
            <div><strong>Phone:</strong> {invoice.customerPhone}</div>
            <div><strong>Email:</strong> {invoice.customerEmail}</div>
            {invoice.customerGstin && <div><strong>Customer GSTIN:</strong> {invoice.customerGstin}</div>}
          </div>

          <div>
            <div className={styles.sectionHeading}>Payment Instructions</div>
            <div><strong>Payment Mode:</strong> Direct Bank Transfer (RTGS / NEFT / IMPS)</div>
            <div><strong>Status:</strong> {invoice.paymentStatus === "PAID" ? "Settled / Verified" : "Pending Bank Transfer"}</div>
            {invoice.paymentStatus === "PAID" && invoice.paidAt && (
              <div><strong>Settled On:</strong> {new Date(invoice.paidAt).toLocaleDateString("en-IN")}</div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th style={{ width: "35px" }}>#</th>
              <th>Description & Specifications</th>
              <th style={{ width: "70px", textAlign: "center" }}>HSN</th>
              <th style={{ width: "50px", textAlign: "center" }}>Qty</th>
              <th style={{ width: "90px", textAlign: "right" }}>Rate (₹)</th>
              <th style={{ width: "95px", textAlign: "right" }}>Taxable (₹)</th>
              <th style={{ width: "65px", textAlign: "center" }}>GST %</th>
              <th style={{ width: "85px", textAlign: "right" }}>Tax (₹)</th>
              <th style={{ width: "100px", textAlign: "right" }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>
                  <strong>{item.description}</strong>
                </td>
                <td style={{ textAlign: "center", fontFamily: "monospace" }}>{item.hsnCode || "—"}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>{formatInr(item.unitPrice).replace("₹", "")}</td>
                <td style={{ textAlign: "right" }}>{formatInr(item.taxableAmount).replace("₹", "")}</td>
                <td style={{ textAlign: "center" }}>{Number(item.gstRate)}%</td>
                <td style={{ textAlign: "right" }}>{formatInr(item.taxAmount).replace("₹", "")}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(item.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Bank Details Grid */}
        <div className={invoice.bankAccountNumber || invoice.bankName ? styles.totalsGrid : styles.totalsGridSingle}>
          {/* Bank Coordinates Box (Optional) */}
          {(invoice.bankAccountNumber || invoice.bankName) && (
            <div className={styles.bankBox}>
              <div className={styles.bankBoxTitle}>Direct Bank Wire Instructions</div>
              {invoice.bankName && (
                <div className={styles.bankDetailRow}>
                  <span>Bank Name:</span>
                  <strong>{invoice.bankName}</strong>
                </div>
              )}
              {invoice.bankAccountName && (
                <div className={styles.bankDetailRow}>
                  <span>Account Name:</span>
                  <strong>{invoice.bankAccountName}</strong>
                </div>
              )}
              {invoice.bankAccountNumber && (
                <div className={styles.bankDetailRow}>
                  <span>Account Number:</span>
                  <strong style={{ fontFamily: "monospace", letterSpacing: "1px" }}>{invoice.bankAccountNumber}</strong>
                </div>
              )}
              {invoice.bankIfsc && (
                <div className={styles.bankDetailRow}>
                  <span>IFSC Code:</span>
                  <strong style={{ fontFamily: "monospace" }}>{invoice.bankIfsc}</strong>
                </div>
              )}
              {invoice.bankBranch && (
                <div className={styles.bankDetailRow}>
                  <span>Branch:</span>
                  <span>{invoice.bankBranch}</span>
                </div>
              )}
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#666" }}>
                * Please share your bank transfer UTR / Transaction Reference number with us after wire completion.
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div>
            <table className={styles.summaryTable}>
              <tbody>
                <tr>
                  <td style={{ color: "#555" }}>Taxable Subtotal:</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(invoice.subtotal)}</td>
                </tr>

                {isInterState ? (
                  <tr>
                    <td style={{ color: "#555" }}>Integrated GST (IGST):</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(invoice.igstAmount)}</td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td style={{ color: "#555" }}>Central GST (CGST):</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(invoice.cgstAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: "#555" }}>State GST (SGST):</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(invoice.sgstAmount)}</td>
                    </tr>
                  </>
                )}

                {Number(invoice.shippingCharges) > 0 && (
                  <tr>
                    <td style={{ color: "#555" }}>
                      Crating, Packaging & Freight:
                      {Number(invoice.shippingGstRate) > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "#888" }}> (+{Number(invoice.shippingGstRate)}% GST)</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatInr(Number(invoice.shippingCharges) + Number(invoice.shippingTaxAmount))}
                    </td>
                  </tr>
                )}

                {Number(invoice.roundOffAmount) !== 0 && (
                  <tr>
                    <td style={{ color: "#555" }}>Round Off:</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatInr(invoice.roundOffAmount)}</td>
                  </tr>
                )}

                <tr className={styles.grandTotalRow}>
                  <td>Grand Total:</td>
                  <td style={{ textAlign: "right" }}>{formatInr(invoice.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes & Signature */}
        <div className={styles.sheetFooter}>
          <div style={{ maxWidth: "60%" }}>
            <strong>Terms & Notes:</strong>
            <p style={{ margin: "0.25rem 0 0 0", lineHeight: 1.4 }}>
              {invoice.notes || "All pieces are handcrafted from solid seasoned natural timber. Subject to Jodhpur jurisdiction."}
            </p>
          </div>

          <div className={styles.signatureBox}>
            <div className={styles.signatureLine}>
              For {invoice.businessName}
              <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "2px" }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

