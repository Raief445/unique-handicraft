const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: "side-tables" }
  });

  if (!category) {
    console.error("Side-tables category not found.");
    return;
  }

  const sourceFile = "C:\\Users\\Raief\\.gemini\\antigravity-ide\\brain\\90b6f418-d0b5-4275-8082-f69dbeba3213\\.user_uploaded\\media_1788020414853.jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `wooden-pedestal-side-table-${Date.now()}.jpg`;
  const destFile = path.join(uploadDir, fileName);

  // Copy the image
  fs.copyFileSync(sourceFile, destFile);
  console.log("Image copied to:", destFile);

  const product = await prisma.product.create({
    data: {
      name: "Elegant Dark Wood Pedestal Side Table",
      productCode: "ST-WD-002",
      categoryId: category.id,
      shortDescription: "A striking round side table featuring a curved pedestal base in a dark espresso finish.",
      description: "Add a touch of modern elegance to your home with this beautiful dark wood side table. Its unique trumpet-shaped pedestal base and perfectly round top make it a versatile accent piece for any living room or lounge area.",
      material: "Solid Wood",
      length: 45,
      width: 45,
      height: 60,
      dimensionUnit: "cm",
      weight: 12,
      weightUnit: "kg",
      finish: "Dark Espresso",
      colour: "Dark Brown",
      moq: 1,
      customizationAvailable: true,
      featured: false,
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
