import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const file = await prisma.enquiryFile.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // If it's a data URI (base64)
    if (file.fileUrl.startsWith("data:")) {
      const match = file.fileUrl.match(/^data:(.+);base64,(.+)$/);
      if (match && match.length === 3) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `inline; filename="${file.fileName}"`,
          },
        });
      }
    }

    // Fallback if it's not base64 or legacy
    return NextResponse.redirect(new URL(file.fileUrl, req.url));
  } catch (error) {
    console.error("Failed to fetch file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
