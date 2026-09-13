const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Stool'
      }
    },
    include: {
      images: true
    }
  });
  console.log("STOOLS:");
  products.forEach(p => console.log(p.images.map(i => i.imageUrl)));

  const mirrors = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Mirror'
      }
    },
    include: {
      images: true
    }
  });
  console.log("MIRRORS:");
  mirrors.forEach(p => console.log(p.images.map(i => i.imageUrl)));
}

main().catch(console.error).finally(() => prisma.$disconnect());
