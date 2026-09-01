import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, phone, subject, message } = body;

    if (!name || !company || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newContactMessage = await prisma.contactMessage.create({
      data: {
        name,
        company,
        email,
        phone,
        subject,
        message,
      },
    });

    // Send email notification (non-blocking)
    sendContactEmailNotification(newContactMessage).catch(console.error);

    return NextResponse.json({ success: true, data: newContactMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function sendContactEmailNotification(data: any) {
  try {
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
      console.log("SMTP not configured. Skipping email. Contact Message:", data.id);
      return;
    }

    const transporter = nodemailer.createTransport(transportConfig);
    const adminEmail = "uniquetimberhandicraftjodhpur@gmail.com";

    // Notify admin
    await transporter.sendMail({
      from: `"Unique Timber Website" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Contact Message: ${data.subject} — ${data.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
          <h2 style="background:#3A2F28;color:#C1A27A;padding:20px;margin:0;">New Contact Message Received</h2>
          <div style="padding:20px;">
            <h3>Subject: ${data.subject}</h3>
            <hr/>
            <h4>Sender Details</h4>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Company:</strong> ${data.company}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
            <hr/>
            <h4>Message</h4>
            <p style="white-space: pre-wrap;">${data.message}</p>
            <hr/>
            <p style="color:#888;font-size:12px;">Submitted on: ${new Date().toLocaleString("en-IN")}</p>
          </div>
        </div>
      `,
    });

  } catch (error) {
    console.error("Email sending error:", error);
  }
}
