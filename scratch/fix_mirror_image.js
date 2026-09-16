const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Mirror...');
  const mirrorImage = 'https://myimgs.org/storage/images/38146/Frontmirror.png';
  
  await prisma.category.updateMany({ 
    where: { name: 'Mirror Frames' }, 
    data: { image: mirrorImage }
  });
  
  const mirror = await prisma.product.findFirst({ where: { productCode: 'UT-NEW-94' } });
  
  if(mirror) {
    await prisma.productImage.updateMany({ 
      where: { productId: mirror.id, imageType: 'MAIN' }, 
      data: { imageUrl: mirrorImage }
    });
  }

  console.log('Done!');
}

main().finally(() => prisma.$disconnect());
