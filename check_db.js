const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log("CATEGORIES:");
  console.dir(categories, { depth: null });
  const products = await prisma.product.findMany({ include: { images: true }});
  const stoolOrMirror = products.filter(p => p.name.toLowerCase().includes('stool') || p.name.toLowerCase().includes('mirror'));
  console.log("\nPRODUCTS:");
  console.dir(stoolOrMirror, { depth: null });
}
main().finally(() => prisma.$disconnect());
