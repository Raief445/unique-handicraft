const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Stool...');
  const stoolImage = 'https://myimgs.org/storage/images/38145/Stool.png';
  
  await prisma.category.updateMany({ 
    where: { name: 'Stools' }, 
    data: { image: stoolImage }
  });
  
  const stool = await prisma.product.findFirst({ where: { productCode: 'UT-STL-001' } });
  
  if(stool) {
    await prisma.productImage.updateMany({ 
      where: { productId: stool.id, imageType: 'MAIN' }, 
      data: { imageUrl: stoolImage }
    });
  }

  console.log('Done!');
}

main().finally(() => prisma.$disconnect());
