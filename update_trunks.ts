import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating Trunks category image...');
  await prisma.category.updateMany({
    where: { name: 'Trunks' },
    data: { image: 'https://i.postimg.cc/RCTmytrT/trunks.png' }
  });

  console.log('Update complete.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
