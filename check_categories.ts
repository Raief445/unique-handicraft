import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          images: {
            where: { imageType: 'MAIN' }
          }
        }
      }
    }
  });

  for (const cat of categories) {
    console.log(`\n======================================================`);
    console.log(`Category: ${cat.name}`);
    console.log(`Current Cover Image: ${cat.image}`);
    console.log(`Available Products in Category:`);
    cat.products.forEach(p => {
      console.log(`  - Product: ${p.name}`);
      console.log(`    Main Image: ${p.images[0]?.imageUrl}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
