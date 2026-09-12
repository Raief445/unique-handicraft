const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    'User',
    'Category',
    'Product',
    'ProductImage',
    'Enquiry',
    'EnquiryItem',
    'EnquiryFile',
    'ContactMessage'
  ];

  for (const table of tables) {
    console.log(`Enabling RLS for ${table}...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
  }

  console.log("RLS successfully enabled on all tables!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
