const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating Stool...');
  const stoolImage = 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop';
  
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

  console.log('Updating Mirror...');
  const mirrorImage = 'https://images.unsplash.com/photo-1618220179428-22790b46a013?q=80&w=800&auto=format&fit=crop';
  
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
