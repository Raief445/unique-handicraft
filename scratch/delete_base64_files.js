const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const files = await prisma.enquiryFile.findMany();
  
  for (const file of files) {
    if (file.fileUrl.startsWith('data:')) {
      console.log(`Deleting file ${file.id} because it is base64 data URI`);
      await prisma.enquiryFile.delete({ where: { id: file.id } });
    }
  }
  
  console.log('Done!');
}

main().finally(() => prisma.$disconnect());
