import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  sendNewEnquiryCustomerEmail,
  sendNewEnquiryAdminEmail,
} from "@/lib/email";

// Simple in-memory rate limiter (scoped per serverless container)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (record.count >= MAX_REQUESTS) {
    return true;
  }
  record.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

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
      let fileType = file.type;
      const fileNameLower = (file.name || "").toLowerCase();
      const ext = fileNameLower.split(".").pop();

      // If mime type is missing or generic octet-stream, infer from extension
      if (!fileType || fileType === "application/octet-stream") {
        if (ext === "jpg" || ext === "jpeg") fileType = "image/jpeg";
        else if (ext === "png") fileType = "image/png";
        else if (ext === "webp") fileType = "image/webp";
        else if (ext === "pdf") fileType = "application/pdf";
        else if (ext === "heic") fileType = "image/heic";
        else if (ext === "heif") fileType = "image/heif";
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "image/gif",
        "application/pdf",
      ];

      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a JPG, PNG, WEBP, or PDF file." },
          { status: 400 }
        );
      }

      if (file.size > 4.5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum file size is 4.5MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Str = buffer.toString("base64");
      const fileUrl = `data:${fileType};base64,${base64Str}`;
      
      fileRecord = { fileName: file.name || "attachment", fileUrl, fileType };
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

    // Send emails in parallel using the luxury branded template
    await Promise.allSettled([
      // 1. Send confirmation email to Customer
      sendNewEnquiryCustomerEmail({
        to: email,
        customerName: fullName,
        companyName,
        phone,
        enquiryNumber: enquiry.enquiryNumber,
        expectedQuantity,
        deliveryDate,
        customizationRequired,
        message,
        items,
      }),
      // 2. Send notification email to Admin
      sendNewEnquiryAdminEmail({
        enquiryNumber: enquiry.enquiryNumber,
        enquiryId: enquiry.id,
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
        fileRecord,
      }),
    ]);

    return NextResponse.json({ enquiryNumber: enquiry.enquiryNumber });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
