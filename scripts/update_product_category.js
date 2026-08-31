const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const newCategory = await prisma.category.findUnique({
    where: { slug: "round-tables" }
  });

  if (!newCategory) {
    console.error("Round-tables category not found.");
    return;
  }

  const updatedProduct = await prisma.product.update({
    where: { productCode: "ST-WD-002" },
    data: {
      categoryId: newCategory.id
    }
  });

  console.log("Successfully moved product", updatedProduct.name, "to round-tables category.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
