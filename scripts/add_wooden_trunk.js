const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: "trunks" }
  });

  if (!category) {
    console.error("Trunks category not found.");
    return;
  }

  const sourceFile = "C:\\Users\\Raief\\.gemini\\antigravity-ide\\brain\\23b4937c-5096-41c0-ab23-a7f7c0fee19c\\.user_uploaded\\media_1787944220949.jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `wooden-trunk-arched-${Date.now()}.jpg`;
  const destFile = path.join(uploadDir, fileName);

  // Copy the image
  fs.copyFileSync(sourceFile, destFile);
  console.log("Image copied to:", destFile);

  const product = await prisma.product.create({
    data: {
      name: "Rustic Arched Panel Wooden Trunk",
      productCode: "TRK-WD-001",
      categoryId: category.id,
      shortDescription: "A beautifully crafted rustic wooden trunk featuring elegant arched panel detailing.",
      description: "Perfect for storage or as a distinctive accent piece, this solid wood chest brings vintage charm and practicality to any room. Expertly crafted with a rich, distressed finish and featuring four classic arched panels on the front, it offers generous internal storage for blankets, pillows, or keepsakes.",
      material: "Solid Mango Wood",
      length: 120,
      width: 45,
      height: 50,
      dimensionUnit: "cm",
      weight: 35,
      weightUnit: "kg",
      finish: "Distressed Rustic Brown",
      colour: "Dark Brown",
      moq: 1,
      customizationAvailable: true,
      featured: false, // Set to false so it doesn't overwrite the Hero image you just set
      status: "PUBLISHED",
      images: {
        create: [
          {
            imageUrl: `/uploads/products/${fileName}`,
            imageType: "MAIN",
            displayOrder: 0
          }
        ]
      }
    }
  });

  console.log("Successfully added product:", product.name);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
