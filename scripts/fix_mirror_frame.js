const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Fixing categories and products...");

    // 1. Create "Mirror Frames" category
    let mirrorCategory = await prisma.category.findFirst({
      where: { name: "Mirror Frames" }
    });

    if (!mirrorCategory) {
      mirrorCategory = await prisma.category.create({
        data: {
          name: "Mirror Frames",
          slug: "mirror-frames",
          description: "Premium handcrafted wooden mirror frames.",
          status: "ACTIVE",
          displayOrder: 20,
        }
      });
      console.log("Created category: Mirror Frames");
    } else {
      console.log("Category 'Mirror Frames' already exists.");
    }

    // 2. Find the product I added earlier named "Premium Handcrafted Product"
    const product = await prisma.product.findFirst({
      where: { name: "Premium Handcrafted Product" }
    });

    if (product) {
      // 3. Update the product to rename it and move it to Mirror Frames
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: "Carved Wooden Mirror Frame",
          shortDescription: "A beautifully carved wooden mirror frame.",
          description: "Add a touch of elegance to your space with this intricately carved wooden mirror frame. Handcrafted by master artisans, this piece perfectly complements any traditional or modern decor.",
          categoryId: mirrorCategory.id
        }
      });
      console.log("Updated product name to 'Carved Wooden Mirror Frame' and moved to 'Mirror Frames' category.");
    } else {
      console.log("Could not find the product to update. It may have been renamed already.");
    }

    console.log("Success!");
  } catch (error) {
    console.error("Error fixing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
