import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const nodemailer = (await import("nodemailer")).default;

    const transportConfig = process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : null;

    if (!transportConfig) {
      return NextResponse.json({ 
        error: "SMTP details are missing from Vercel.", 
        help: "Make sure you added SMTP_HOST, SMTP_USER, and SMTP_PASS." 
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify connection configuration
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "SMTP is perfectly configured! The server is ready to send emails.", 
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to connect to SMTP server.", 
      details: error.message 
    }, { status: 500 });
  }
}
