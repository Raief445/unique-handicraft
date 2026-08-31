import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import fs from "fs";
import path from "path";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const productCode = formData.get("productCode") as string;
    const categoryId = formData.get("categoryId") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const material = formData.get("material") as string;
    const length = parseFloat(formData.get("length") as string);
    const width = parseFloat(formData.get("width") as string);
    const height = parseFloat(formData.get("height") as string);
    const dimensionUnit = formData.get("dimensionUnit") as string;
    const weight = parseFloat(formData.get("weight") as string);
    const weightUnit = formData.get("weightUnit") as string;
    const finish = formData.get("finish") as string;
    const colour = formData.get("colour") as string;
    const moq = parseInt(formData.get("moq") as string);
    const customizationAvailable = formData.get("customizationAvailable") === "true";
    const featured = formData.get("featured") === "true";
    const isHero = formData.get("isHero") === "true";
    const status = formData.get("status") as string;
    const seoTitle = formData.get("seoTitle") as string;
    const seoDescription = formData.get("seoDescription") as string;
    const displayOrder = formData.get("displayOrder") as string;
    const featuredOrder = formData.get("featuredOrder") as string;

    const mainImageUrl = formData.get("mainImageUrl") as string | null;
    const galleryImageUrlsStr = formData.get("galleryImageUrls") as string | null;

    if (!name || !productCode || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sync Main Image
    await prisma.productImage.deleteMany({
      where: { productId: id, imageType: "MAIN" }
    });
    if (mainImageUrl && mainImageUrl.trim() !== "") {
      await prisma.productImage.create({
        data: { productId: id, imageUrl: mainImageUrl.trim(), imageType: "MAIN", displayOrder: 0 }
      });
    }

    // Sync Gallery Images
    await prisma.productImage.deleteMany({
      where: { productId: id, imageType: "GALLERY" }
    });
    if (galleryImageUrlsStr && galleryImageUrlsStr.trim() !== "") {
      const urls = galleryImageUrlsStr.split(",").map(u => u.trim()).filter(u => u !== "");
      for (let i = 0; i < urls.length; i++) {
        await prisma.productImage.create({
          data: { productId: id, imageUrl: urls[i], imageType: "GALLERY", displayOrder: i + 1 }
        });
      }
    }

    if (isHero) {
      await prisma.product.updateMany({
        where: { 
          isHero: true,
          id: { not: params.id } 
        },
        data: { isHero: false }
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        productCode,
        categoryId,
        shortDescription: shortDescription || null,
        description: description || null,
        material: material || null,
        length: isNaN(length) ? null : length,
        width: isNaN(width) ? null : width,
        height: isNaN(height) ? null : height,
        dimensionUnit: dimensionUnit || null,
        weight: isNaN(weight) ? null : weight,
        weightUnit: weightUnit || null,
        finish: finish || null,
        colour: colour || null,
        moq: isNaN(moq) ? 1 : moq,
        customizationAvailable,
        featured,
        isHero,
        status: status as any,
        displayOrder: parseInt(displayOrder) || 0,
        featuredOrder: parseInt(featuredOrder) || 0,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
