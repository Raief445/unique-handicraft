const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const highResImageUrl = 'https://cdn.myimgs.org/images/76635/minimalist_trunk.jpg';

  console.log('Updating Minimalist Dark Wood Storage Trunk image...');
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { productCode: 'TRK-MIN-DRK-002' },
        { name: { contains: 'Minimalist Dark Wood Storage Trunk', mode: 'insensitive' } }
      ]
    }
  });

  if (product) {
    const result = await prisma.productImage.updateMany({
      where: {
        productId: product.id,
        imageType: 'MAIN'
      },
      data: {
        imageUrl: highResImageUrl
      }
    });
    console.log('Successfully updated product main image count:', result.count);
  } else {
    console.error('Product not found!');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

