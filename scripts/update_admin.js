const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Updating admin user...");

  const adminEmail = "raiefbelim450@gmail.com";
  const hashedPassword = await bcrypt.hash("heyraief@123", 10);

  // 1. Delete dummy admin if it exists
  await prisma.user.deleteMany({
    where: { email: "admin@uniquetimber.com" }
  });
  console.log("Dummy admin removed.");

  // 2. Create or Update actual admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN"
    },
    create: {
      name: "Raief Belim",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    }
  });

  console.log("Admin user updated successfully:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
