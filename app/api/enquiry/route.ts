import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Parse fields
    const fullName = formData.get("fullName") as string;
    const companyName = formData.get("companyName") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || "";
    const location = formData.get("location") as string;
    const country = formData.get("country") as string;
    const designation = (formData.get("designation") as string) || "";
    const expectedQuantity = formData.get("expectedQuantity") as string;
    const deliveryDate = (formData.get("deliveryDate") as string) || "";
    const customizationRequired = formData.get("customizationRequired") === "yes";
    const message = (formData.get("message") as string) || "";
    const itemsJson = formData.get("items") as string;

    // Validation
    if (!fullName || !companyName || !email || !location || !country) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    let items: Array<{ productId: string; name: string; productCode: string; quantity: number }> = [];
    try {
      items = JSON.parse(itemsJson || "[]");
    } catch {
      return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No products in enquiry." }, { status: 400 });
    }

    // Generate Enquiry Number: ENQ-XXXX-NNN
    const count = await prisma.enquiry.count();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const baseNumber = 250;
    const enquiryNumber = `ENQ-${randomChars}-${baseNumber + count + 1}`;

    // Handle file upload
    let fileRecord = null;
    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const safeFileName = `${enquiryNumber}-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, safeFileName), buffer);
      fileRecord = { fileName: file.name, fileUrl: `/uploads/${safeFileName}`, fileType: file.type };
    }

    // Create Enquiry in DB
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerName: fullName,
        companyName,
        email,
        phone,
        location,
        country,
        designation,
        expectedQuantity: expectedQuantity ? parseInt(expectedQuantity) : null,
        deliveryDate: deliveryDate || null,
        customizationRequired,
        message,
        status: "NEW",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.name,
            productCodeSnapshot: item.productCode,
            quantity: Math.max(1, Math.min(1000, item.quantity)),
          })),
        },
        files: fileRecord
          ? {
              create: [fileRecord],
            }
          : undefined,
      },
    });

    // Send email notification (non-blocking)
    sendEmailNotification(enquiry.enquiryNumber, {
      fullName,
      companyName,
      email,
      phone,
      location,
      country,
      designation,
      expectedQuantity,
      deliveryDate,
      customizationRequired,
      message,
      items,
    }).catch(console.error);

    return NextResponse.json({ enquiryNumber: enquiry.enquiryNumber });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

async function sendEmailNotification(enquiryNumber: string, data: any) {
  try {
    // Only send if nodemailer and SMTP credentials are configured
    const nodemailer = (await import("nodemailer")).default;

    const transportConfig = process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : null;

    if (!transportConfig) {
      console.log("SMTP not configured. Skipping email. Enquiry:", enquiryNumber);
      return;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const itemsHtml = data.items
      .map(
        (item: any) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd;">${item.productCode}</td>
            <td style="padding:8px;border:1px solid #ddd;">${item.quantity}</td>
          </tr>`
      )
      .join("");

    const adminEmail = "uniquetimberhandicraftjodhpur@gmail.com";

    // Notify admin
    await transporter.sendMail({
      from: `"Unique Timber Website" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Enquiry: ${enquiryNumber} — ${data.companyName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
          <h2 style="background:#3A2F28;color:#C1A27A;padding:20px;margin:0;">New Enquiry Received</h2>
          <div style="padding:20px;">
            <h3>Enquiry Number: ${enquiryNumber}</h3>
            <hr/>
            <h4>Customer Details</h4>
            <p><strong>Name:</strong> ${data.fullName}</p>
            <p><strong>Company:</strong> ${data.companyName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
            <p><strong>Location:</strong> ${data.location}, ${data.country}</p>
            ${data.designation ? `<p><strong>Designation:</strong> ${data.designation}</p>` : ""}
            <hr/>
            <h4>Products Enquired</h4>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
                  <th style="padding:8px;border:1px solid #ddd;text-align:left;">Code</th>
                  <th style="padding:8px;border:1px solid #ddd;text-align:left;">Qty</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <hr/>
            <h4>Requirements</h4>
            ${data.expectedQuantity ? `<p><strong>Expected Quantity:</strong> ${data.expectedQuantity}</p>` : ""}
            ${data.deliveryDate ? `<p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>` : ""}
            <p><strong>Customization:</strong> ${data.customizationRequired ? "Yes" : "No"}</p>
            ${data.message ? `<p><strong>Message:</strong><br/>${data.message}</p>` : ""}
            <hr/>
            <p style="color:#888;font-size:12px;">Submitted on: ${new Date().toLocaleString("en-IN")}</p>
          </div>
        </div>
      `,
    });

    // Confirm to customer
    await transporter.sendMail({
      from: `"Unique Timber & Handicraft" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: `Enquiry Confirmation — ${enquiryNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="background:#3A2F28;color:#C1A27A;padding:20px;margin:0;">Thank You for Your Enquiry</h2>
          <div style="padding:20px;">
            <p>Dear ${data.fullName},</p>
            <p>We have received your enquiry and will review your requirements shortly.</p>
            <div style="background:#f9f7f3;border:1px solid #e5e0d8;border-radius:6px;padding:16px;margin:20px 0;text-align:center;">
              <span style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Enquiry Number</span><br/>
              <strong style="font-size:24px;color:#3A2F28;">${enquiryNumber}</strong>
            </div>
            <p>Our team will contact you at <strong>${data.email}</strong>${data.phone ? ` or <strong>${data.phone}</strong>` : ""} regarding your enquiry.</p>
            <br/>
            <p>Regards,<br/>Unique Timber & Handicraft<br/>Jodhpur, Rajasthan, India<br/>uniquetimberhandicraftjodhpur@gmail.com</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email sending error:", error);
  }
}
