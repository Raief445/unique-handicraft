import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.category.updateMany({
    where: { name: 'Round Tables' },
    data: { image: 'https://i.postimg.cc/KjQyM67W/R-t-2.jpg' }
  });
  console.log('Reverted Round Tables cover');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
