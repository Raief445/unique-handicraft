const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Reverting Stools...");
  await prisma.category.updateMany({
    where: { name: 'Stools' },
    data: { image: 'https://img.sanishtech.com/u/ef15550c65982fbcef8bb04703c2918f.png' }
  });
  
  console.log("Reverting Mirror Frames...");
  await prisma.category.updateMany({
    where: { name: 'Mirror Frames' },
    data: { image: 'https://img.sanishtech.com/u/eb491f9f0cbbcc0bc1b52015382d0e3f.png' }
  });

  console.log("Reverting Products...");
  const stoolProduct = await prisma.product.findFirst({ where: { productCode: 'UT-STL-001' } });
  if (stoolProduct) {
    await prisma.productImage.updateMany({
      where: { productId: stoolProduct.id, imageType: 'MAIN' },
      data: { imageUrl: 'https://img.sanishtech.com/u/ef15550c65982fbcef8bb04703c2918f.png' }
    });
  }

  const mirrorProduct = await prisma.product.findFirst({ where: { productCode: 'UT-NEW-94' } });
  if (mirrorProduct) {
    await prisma.productImage.updateMany({
      where: { productId: mirrorProduct.id, imageType: 'MAIN' },
      data: { imageUrl: 'https://img.sanishtech.com/u/eb491f9f0cbbcc0bc1b52015382d0e3f.png' }
    });
  }

  console.log("Done reverting DB!");
}

main().finally(() => prisma.$disconnect());
