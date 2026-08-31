const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const sourceFile = "C:\\Users\\Raief\\.gemini\\antigravity-ide\\brain\\23b4937c-5096-41c0-ab23-a7f7c0fee19c\\.user_uploaded\\media_1787943364584.jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = "marble-coffee-table-hero.jpg";
  const destFile = path.join(uploadDir, fileName);

  // Copy the image
  fs.copyFileSync(sourceFile, destFile);
  console.log("Image copied to:", destFile);

  const product = await prisma.product.findUnique({
    where: { productCode: "CT-MRB-FLT-001" }
  });
  if (!product) return;
  const productId = product.id;

  // Delete existing images for this product to prevent duplicates
  await prisma.productImage.deleteMany({
    where: { productId }
  });

  // Create the new main image
  await prisma.productImage.create({
    data: {
      productId,
      imageUrl: `/uploads/products/${fileName}`,
      imageType: "MAIN",
      displayOrder: 0
    }
  });

  // Touch the updatedAt timestamp to make it the most recent featured product
  await prisma.product.update({
    where: { id: productId },
    data: { updatedAt: new Date() }
  });

  console.log("Database updated successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
