const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const updatedProduct = await prisma.product.update({
    where: { productCode: "ET-BLK-SLD-001" },
    data: {
      name: "Solid Wood Block Side Table",
      productCode: "ST-BLK-SLD-001"
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
