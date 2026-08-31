const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Create Admin User
  const adminEmail = "admin@uniquetimber.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created (admin@uniquetimber.com / Admin@123)");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Create Categories
  const categories = [
    { name: "Coffee Tables", slug: "coffee-tables", displayOrder: 1 },
    { name: "Side Tables", slug: "side-tables", displayOrder: 2 },
    { name: "Round Tables", slug: "round-tables", displayOrder: 3 },
    { name: "Trunks", slug: "trunks", displayOrder: 4 },
    { name: "Sideboards", slug: "sideboards", displayOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, status: "ACTIVE" },
    });
  }
  console.log("Categories seeded.");

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
