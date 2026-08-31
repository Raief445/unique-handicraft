const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.category.updateMany({
    where: { slug: "nightstands" },
    data: { name: "Sideboards", slug: "sideboards" }
  });
  console.log("Updated category in DB");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
