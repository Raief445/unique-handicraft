const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: "coffee-tables" }
  });

  if (!category) {
    console.error("Coffee Tables category not found.");
    return;
  }

  const product = await prisma.product.create({
    data: {
      name: "Round Fluted Base Marble Top Coffee Table",
      productCode: "CT-MRB-FLT-001",
      categoryId: category.id,
      shortDescription: "Elegant round coffee table featuring a premium black marble top with white veining and a fluted dark wood base.",
      description: "A stunning centerpiece for modern living spaces. This coffee table combines the timeless beauty of natural black marble with the sophisticated texture of a fluted wooden base. The sturdy construction ensures durability while providing a luxurious aesthetic.",
      material: "Natural Black Marble Top, Solid Wood Fluted Base",
      length: 90,
      width: 90,
      height: 45,
      dimensionUnit: "cm",
      weight: 40,
      weightUnit: "kg",
      finish: "Polished Marble, Dark Walnut Stain",
      colour: "Black & Dark Brown",
      moq: 1,
      customizationAvailable: true,
      featured: true,
      status: "PUBLISHED",
      images: {
        create: [
          {
            imageUrl: "https://placehold.co/600x400/F0EEE9/3A2F28?text=Marble+Coffee+Table", // Placeholder since upload failed
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
