const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  let category = await prisma.category.findUnique({
    where: { slug: "trunks" }
  });

  if (!category) {
    console.log("Trunks category not found, creating one...");
    category = await prisma.category.create({
      data: {
        name: "Trunks & Storage",
        slug: "trunks",
        description: "Elegant and spacious wooden trunks for all your storage needs.",
      }
    });
  }

  const product = await prisma.product.create({
    data: {
      name: "Minimalist Dark Wood Storage Trunk",
      productCode: "TRK-MIN-DRK-002",
      categoryId: category.id,
      shortDescription: "A sleek, minimalist solid wood trunk with a deep espresso finish and integrated cutout handles.",
      description: "This modern storage trunk perfectly balances minimalist design with the natural beauty of solid wood. Featuring a striking deep espresso finish, it offers substantial interior storage space while doubling as a stylish bench or accent table. The subtle, integrated cutout handles provide easy access while maintaining its incredibly clean, seamless profile.",
      material: "Solid Hardwood",
      length: 120,
      width: 45,
      height: 45,
      dimensionUnit: "cm",
      weight: 28,
      weightUnit: "kg",
      finish: "Deep Espresso Stain, Satin Lacquer",
      colour: "Dark Espresso",
      moq: 1,
      customizationAvailable: true,
      featured: true,
      status: "PUBLISHED",
      images: {
        create: [
          {
            imageUrl: "/images/wooden-trunk.jpg",
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
