import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendEnquiryStatusUpdateEmail } from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, notifyCustomer = true, customNote = "" } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const existing = await prisma.enquiry.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const previousStatus = existing.status;
    const statusChanged = previousStatus !== status;

    let updatedAdminNotes = existing.adminNotes || "";
    if (customNote && customNote.trim()) {
      const timestamp = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
      const noteEntry = `[${timestamp}] (Status: ${status}): ${customNote.trim()}`;
      updatedAdminNotes = updatedAdminNotes ? `${updatedAdminNotes}\n\n${noteEntry}` : noteEntry;
    }

    const enquiry = await prisma.enquiry.update({
      where: { id: params.id },
      data: {
        status: status as any,
        adminNotes: updatedAdminNotes || null,
      },
      include: { items: true },
    });

    let emailResult = {
      sent: false,
      reason: !statusChanged
        ? "Status did not change"
        : !notifyCustomer
        ? "Notification deselected by admin"
        : !existing.email
        ? "No customer email address on file"
        : "",
    };

    if (notifyCustomer && statusChanged && existing.email) {
      const result = await sendEnquiryStatusUpdateEmail({
        to: existing.email,
        customerName: existing.customerName,
        companyName: existing.companyName,
        enquiryNumber: existing.enquiryNumber,
        oldStatus: previousStatus,
        newStatus: status,
        adminNote: customNote && customNote.trim() ? customNote.trim() : null,
        items: existing.items,
      });

      emailResult = {
        sent: result.success,
        reason: result.reason || result.error || (result.success ? "Email sent successfully" : "Failed to send"),
      };
    }

    return NextResponse.json({
      success: true,
      enquiry,
      emailSent: emailResult.sent,
      emailReason: emailResult.reason,
    });
  } catch (error: any) {
    console.error("Failed to update enquiry status:", error);
    return NextResponse.json(
      { error: "Failed to update enquiry status", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.enquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete enquiry:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
