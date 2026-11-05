import nodemailer from "nodemailer";

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587");

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export const ENQUIRY_STATUS_DETAILS: Record<
  string,
  { label: string; color: string; description: string }
> = {
  NEW: {
    label: "New Enquiry",
    color: "#E53E3E",
    description:
      "Your enquiry has been received and logged into our system. Our team will review your specifications shortly.",
  },
  CONTACTED: {
    label: "Contacted",
    color: "#DD6B20",
    description:
      "Our team has reviewed your enquiry and initiated contact with you. We look forward to discussing your project and custom requirements.",
  },
  REQUIREMENT_DISCUSSION: {
    label: "Requirement Discussion",
    color: "#D69E2E",
    description:
      "We are currently reviewing and discussing specific dimensions, wood species, finishes, and order details with you.",
  },
  QUOTATION_SENT: {
    label: "Quotation Sent",
    color: "#38A169",
    description:
      "A formal price quotation has been prepared and issued for your requested items. Please review the details and proposal.",
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "#3182CE",
    description:
      "We are working together with you on finalizing commercial terms, production schedules, and pricing to reach an optimal agreement.",
  },
  CONFIRMED: {
    label: "Confirmed / Order Placed",
    color: "#805AD5",
    description:
      "Your order has been officially confirmed! Our master craftsmen will begin scheduling and preparing your order for production.",
  },
  COMPLETED: {
    label: "Completed",
    color: "#2D3748",
    description:
      "Your order/enquiry has been successfully completed and fulfilled. Thank you for partnering with Unique Timber & Handicraft!",
  },
  CLOSED: {
    label: "Closed / Cancelled",
    color: "#718096",
    description:
      "This enquiry has been closed. If you have any further questions, future requirements, or wish to reopen this discussion, please feel free to reach out to us anytime.",
  },
};

export interface SendStatusUpdateEmailOptions {
  to: string;
  customerName: string;
  companyName?: string | null;
  enquiryNumber: string;
  oldStatus?: string | null;
  newStatus: string;
  adminNote?: string | null;
  items?: Array<{
    productNameSnapshot?: string | null;
    productCodeSnapshot?: string | null;
    quantity?: number | null;
  }>;
}

export async function sendEnquiryStatusUpdateEmail({
  to,
  customerName,
  companyName,
  enquiryNumber,
  newStatus,
  adminNote,
  items,
}: SendStatusUpdateEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  reason?: string;
  error?: string;
}> {
  try {
    const transporter = getMailTransporter();

    if (!transporter) {
      console.warn(
        `[Email Notification] SMTP is not configured. Skipped sending email for enquiry ${enquiryNumber} to ${to}.`
      );
      return {
        success: false,
        reason: "SMTP_NOT_CONFIGURED",
      };
    }

    const statusInfo =
      ENQUIRY_STATUS_DETAILS[newStatus] || {
        label: newStatus.replace(/_/g, " "),
        color: "#3A2F28",
        description: `Your enquiry status has been updated to ${newStatus.replace(/_/g, " ")}.`,
      };

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://uniquehandicrafts.in";

    const trackUrl = `${baseUrl.replace(/\/+$/, "")}/track-enquiry?enquiryNumber=${encodeURIComponent(
      enquiryNumber
    )}&email=${encodeURIComponent(to)}`;

    let itemsTableHtml = "";
    if (items && items.length > 0) {
      const rows = items
        .map(
          (item) => `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #2c2520;">
              ${escapeHtml(item.productNameSnapshot || "Item")}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; font-family: monospace;">
              ${escapeHtml(item.productCodeSnapshot || "—")}
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #2c2520; text-align: center;">
              ${item.quantity || 1}
            </td>
          </tr>`
        )
        .join("");

      itemsTableHtml = `
        <div style="margin: 20px 0;">
          <div style="font-size: 13px; font-weight: 700; color: #3A2F28; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Enquired Items
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; border: 1px solid #eee; border-radius: 4px;">
            <thead>
              <tr style="background-color: #f7f5f2;">
                <th style="padding: 8px 12px; border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">Product</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">Code</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #ddd; text-align: center; font-size: 12px; color: #666; text-transform: uppercase;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enquiry Status Update - Unique Timber &amp; Handicraft</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4efe9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2c2520;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4efe9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2f251e; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; color: #c1a27a; font-weight: 700; text-transform: uppercase;">UNIQUE TIMBER &amp; HANDICRAFT</h1>
              <p style="margin: 6px 0 0; font-size: 11px; color: #d6cfc7; letter-spacing: 1px; text-transform: uppercase;">Handcrafted Heritage Furniture &bull; Jodhpur, India</p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <p style="font-size: 15px; margin: 0 0 16px; color: #2c2520;">
                Dear <strong>${escapeHtml(customerName)}</strong>${companyName ? ` (${escapeHtml(companyName)})` : ""},
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px; color: #4a3e35;">
                We are writing to update you on the current status of your enquiry.
              </p>

              <!-- Status Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f6; border: 1px solid #ebdcd0; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; color: #8a7a6e; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 4px;">
                      Enquiry Reference
                    </div>
                    <div style="font-size: 18px; font-weight: 700; color: #2f251e; font-family: monospace; margin-bottom: 12px;">
                      ${escapeHtml(enquiryNumber)}
                    </div>
                    
                    <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: ${statusInfo.color}; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      Status: ${statusInfo.label}
                    </div>

                    <p style="font-size: 14px; line-height: 1.5; color: #4a3e35; margin: 14px 0 0;">
                      ${statusInfo.description}
                    </p>
                  </td>
                </tr>
              </table>

              ${
                adminNote
                  ? `
              <!-- Note from Admin -->
              <div style="background-color: #fff9ed; border-left: 4px solid #c1a27a; padding: 14px 18px; margin-bottom: 24px; border-radius: 4px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8c6734; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Message from our team:
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #3a2f28; white-space: pre-line;">
                  ${escapeHtml(adminNote)}
                </div>
              </div>
              `
                  : ""
              }

              ${itemsTableHtml}

              <!-- Track Button -->
              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${trackUrl}" target="_blank" style="display: inline-block; background-color: #2f251e; color: #c1a27a; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; border: 1px solid #c1a27a;">
                  Track Your Enquiry Online &rarr;
                </a>
              </div>
              <p style="font-size: 12px; color: #8a7a6e; text-align: center; margin: 0 0 24px;">
                You can also track your enquiry anytime at <a href="https://uniquehandicrafts.in/track-enquiry" style="color: #8c6734; text-decoration: underline;">uniquehandicrafts.in/track-enquiry</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4efe9; border-top: 1px solid #ebdcd0; padding: 22px 32px; text-align: center; font-size: 12px; color: #7a6e65; line-height: 1.6;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #2f251e;">Unique Timber &amp; Handicraft</p>
              <p style="margin: 0 0 4px;">Jodhpur, Rajasthan, India</p>
              <p style="margin: 0 0 4px;">Email: <a href="mailto:uniquetimberhandicraftjodhpur@gmail.com" style="color: #8c6734; text-decoration: none;">uniquetimberhandicraftjodhpur@gmail.com</a></p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #9c9288;">&copy; ${new Date().getFullYear()} Unique Timber &amp; Handicraft. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `"Unique Timber & Handicraft" <${process.env.SMTP_USER}>`,
      to,
      subject: `Enquiry Update: ${enquiryNumber} — Status changed to ${statusInfo.label}`,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[Email Notification] Failed to send status update email:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

