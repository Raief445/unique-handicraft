const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  let category = await prisma.category.findUnique({
    where: { slug: "side-tables" }
  });

  if (!category) {
    console.log("Side Tables category not found, creating one...");
    category = await prisma.category.create({
      data: {
        name: "Side Tables",
        slug: "side-tables",
        description: "Versatile and stylish side tables to complement your seating arrangements.",
      }
    });
  }

  const product = await prisma.product.create({
    data: {
      name: "Solid Wood Block End Table",
      productCode: "ET-BLK-SLD-001",
      categoryId: category.id,
      shortDescription: "A robust and stylish block-style end table featuring a unique patchwork solid wood design.",
      description: "Crafted from beautiful solid wood pieces arranged in a striking patchwork pattern, this cylindrical end table brings immense character and a warm, earthy feel to any room. Its robust block-like form factor offers immense stability and a perfect surface for your morning coffee or favorite book.",
      material: "Solid Mango Wood",
      length: 40,
      width: 40,
      height: 55,
      dimensionUnit: "cm",
      weight: 15,
      weightUnit: "kg",
      finish: "Natural Wood Stain, Matte Lacquer",
      colour: "Warm Brown",
      moq: 1,
      customizationAvailable: true,
      featured: true,
      status: "PUBLISHED",
      images: {
        create: [
          {
            imageUrl: "/images/block-end-table.jpg",
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
