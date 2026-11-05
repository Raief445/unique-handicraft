const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const highResTrunkImage = '/uploads/products/wooden-trunk-arched-1788165440051.jpg';

  console.log('Updating Trunks category cover image...');
  const catResult = await prisma.category.updateMany({
    where: {
      OR: [
        { name: 'Trunks' },
        { slug: 'trunks' }
      ]
    },
    data: {
      image: highResTrunkImage
    }
  });
  console.log('Updated categories count:', catResult.count);

  console.log('Updating Rustic Arched Panel Wooden Trunk product images...');
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { productCode: 'TRK-WD-001' },
        { name: { contains: 'Rustic Arched', mode: 'insensitive' } }
      ]
    }
  });

  if (product) {
    const imgResult = await prisma.productImage.updateMany({
      where: {
        productId: product.id,
        imageType: 'MAIN'
      },
      data: {
        imageUrl: highResTrunkImage
      }
    });
    console.log('Updated product main image for product:', product.name, '(count:', imgResult.count, ')');
  } else {
    console.log('Rustic Arched trunk product not found!');
  }

  console.log('Trunk image update complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

