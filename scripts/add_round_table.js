const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: "round-tables" }
  });

  if (!category) {
    console.error("Round Tables category not found.");
    return;
  }

  const fallbackSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F0EEE9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%233A2F28%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

  const product = await prisma.product.create({
    data: {
      name: "Fluted Base Walnut Round Table",
      productCode: "RT-WLN-001",
      categoryId: category.id,
      shortDescription: "An elegant large round table crafted from rich walnut wood, featuring a striking fluted cylindrical base.",
      description: "Designed to be the centerpiece of any dining room or spacious living area, this magnificent round table combines classic woodworking with modern design. The expansive circular top showcases the beautiful natural grain of solid walnut, while the robust cylindrical base features intricate fluted detailing. A true masterpiece of craftsmanship.",
      material: "Solid Walnut Wood",
      length: 120,
      width: 120,
      height: 75,
      dimensionUnit: "cm",
      weight: 60,
      weightUnit: "kg",
      finish: "Smooth Matte Walnut",
      colour: "Dark Walnut / Brown",
      moq: 1,
      customizationAvailable: true,
      featured: true,
      status: "PUBLISHED",
      images: {
        create: [
          {
            imageUrl: fallbackSvg,
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
