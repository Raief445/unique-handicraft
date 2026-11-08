import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "MOVE") {
      const { productId, direction } = body;
      if (!productId || !direction) {
        return NextResponse.json({ error: "Missing productId or direction" }, { status: 400 });
      }

      // Fetch all published/draft products sorted by current displayOrder
      const allProducts = await prisma.product.findMany({
        where: { status: { not: "ARCHIVED" } },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, displayOrder: true },
      });

      const currentIndex = allProducts.findIndex((p) => p.id === productId);
      if (currentIndex === -1) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= allProducts.length) {
        return NextResponse.json({ message: "Already at boundary" });
      }

      const currentItem = allProducts[currentIndex];
      const targetItem = allProducts[targetIndex];

      // If both have the same displayOrder, resequence everyone cleanly first
      if (currentItem.displayOrder === targetItem.displayOrder) {
        await prisma.$transaction(
          allProducts.map((p, idx) =>
            prisma.product.update({
              where: { id: p.id },
              data: { displayOrder: idx + 1 },
            })
          )
        );
      }

      // Swap displayOrder between currentItem and targetItem
      const updatedList = await prisma.product.findMany({
        where: { status: { not: "ARCHIVED" } },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, displayOrder: true },
      });

      const currentOrder = updatedList[currentIndex].displayOrder;
      const targetOrder = updatedList[targetIndex].displayOrder;

      // Swap
      await prisma.$transaction([
        prisma.product.update({
          where: { id: currentItem.id },
          data: { displayOrder: targetOrder },
        }),
        prisma.product.update({
          where: { id: targetItem.id },
          data: { displayOrder: currentOrder },
        }),
      ]);
    } else if (action === "SET_ORDER") {
      const { productId, newOrder } = body;
      if (!productId || typeof newOrder !== "number") {
        return NextResponse.json({ error: "Missing productId or valid newOrder" }, { status: 400 });
      }

      await prisma.product.update({
        where: { id: productId },
        data: { displayOrder: Math.max(0, Math.round(newOrder)) },
      });
    } else if (action === "RESEQUENCE") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) {
        return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
      }

      await prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.product.update({
            where: { id },
            data: { displayOrder: index + 1 },
          })
        )
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Invalidate caches so the new order reflects everywhere instantly
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder products error:", error);
    return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
  }
}
