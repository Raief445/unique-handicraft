const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updatedProduct = await prisma.product.update({
    where: { productCode: "ST-WD-002" },
    data: {
      name: "Elegant Dark Wood Pedestal Round Table",
      productCode: "RT-WD-002",
      shortDescription: "A striking round table featuring a curved pedestal base in a dark espresso finish."
    }
  });

  console.log("Successfully updated product name and code:");
  console.log("New Name:", updatedProduct.name);
  console.log("New Code:", updatedProduct.productCode);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
