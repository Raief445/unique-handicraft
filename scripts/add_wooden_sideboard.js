const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: "sideboards" }
  });

  if (!category) {
    console.error("Sideboards category not found.");
    return;
  }

  const sourceFile = "C:\\Users\\Raief\\.gemini\\antigravity-ide\\brain\\90b6f418-d0b5-4275-8082-f69dbeba3213\\.user_uploaded\\media_1788019723928.jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `wooden-curved-sideboard-${Date.now()}.jpg`;
  const destFile = path.join(uploadDir, fileName);

  // Copy the image
  fs.copyFileSync(sourceFile, destFile);
  console.log("Image copied to:", destFile);

  const product = await prisma.product.create({
    data: {
      name: "Elegant Curved Wooden Sideboard",
      productCode: "SB-WD-001",
      categoryId: category.id,
      shortDescription: "A sophisticated wooden sideboard featuring beautifully curved edges and a rich walnut finish.",
      description: "Enhance your living space with this elegantly designed wooden sideboard. It features smooth curved edges, a rich walnut finish, and two spacious compartments with solid wood doors. Perfect for dining rooms or living areas, it provides ample storage while serving as a stunning statement piece.",
      material: "Solid Walnut Wood",
      length: 180,
      width: 45,
      height: 75,
      dimensionUnit: "cm",
      weight: 65,
      weightUnit: "kg",
      finish: "Rich Walnut",
      colour: "Walnut Brown",
      moq: 1,
      customizationAvailable: true,
      featured: true,
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
