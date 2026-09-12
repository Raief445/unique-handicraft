const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Stools...");
  await prisma.category.updateMany({
    where: { name: 'Stools' },
    data: { image: '/uploads/stool.png' }
  });
  
  console.log("Updating Mirror Frames...");
  await prisma.category.updateMany({
    where: { name: 'Mirror Frames' },
    data: { image: '/uploads/mirror.png' }
  });

  console.log("Updating Products...");
  const stoolProduct = await prisma.product.findFirst({ where: { productCode: 'UT-STL-001' } });
  if (stoolProduct) {
    await prisma.productImage.updateMany({
      where: { productId: stoolProduct.id, imageType: 'MAIN' },
      data: { imageUrl: '/uploads/stool.png' }
    });
  }

  const mirrorProduct = await prisma.product.findFirst({ where: { productCode: 'UT-NEW-94' } });
  if (mirrorProduct) {
    await prisma.productImage.updateMany({
      where: { productId: mirrorProduct.id, imageType: 'MAIN' },
      data: { imageUrl: '/uploads/mirror.png' }
    });
  }

  console.log("Done updating DB!");
}

main().finally(() => prisma.$disconnect());
