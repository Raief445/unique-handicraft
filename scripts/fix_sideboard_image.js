const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const highResSideboardImage = '/uploads/products/wooden-curved-sideboard-1788165439121.jpg';

  console.log('Updating Sideboards category cover image...');
  const catResult = await prisma.category.updateMany({
    where: {
      OR: [
        { name: 'Sideboards' },
        { slug: 'sideboards' }
      ]
    },
    data: {
      image: highResSideboardImage
    }
  });
  console.log('Updated categories count:', catResult.count);

  console.log('Updating Elegant Curved Wooden Sideboard product images...');
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { productCode: 'SB-WD-001' },
        { name: { contains: 'Sideboard', mode: 'insensitive' } }
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
        imageUrl: highResSideboardImage
      }
    });
    console.log('Updated product main image for product:', product.name, '(count:', imgResult.count, ')');
  } else {
    console.log('Sideboard product not found!');
  }

  console.log('Sideboard image update complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

