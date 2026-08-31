const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: "Solid Wood Block End Table" } },
        { name: { contains: "Solid Wood Block" } },
        { name: { contains: "End Table" } }
      ]
    }
  });

  console.log("Found products:", products.map(p => ({ id: p.id, name: p.name, code: p.productCode })));
}

main().finally(() => prisma.$disconnect());
