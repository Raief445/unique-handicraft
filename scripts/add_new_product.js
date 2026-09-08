const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding new product...");

    // Get the first available category, preferably "Stools" or anything
    let category = await prisma.category.findFirst({
      where: { name: "Stools" }
    });

    if (!category) {
      category = await prisma.category.findFirst();
    }

    if (!category) {
      console.log("No categories exist. Please create one first.");
      return;
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: "Premium Handcrafted Product",
        productCode: "UT-NEW-" + Math.floor(Math.random() * 1000),
        shortDescription: "A beautiful handcrafted wooden piece.",
        description: "This premium wooden furniture combines timeless design with robust construction. Crafted by master artisans in Jodhpur.",
        material: "Solid Mango Wood",
        finish: "Natural Honey Finish",
        dimensionUnit: "INCH",
        length: 20,
        width: 20,
        height: 20,
        status: "PUBLISHED",
        featured: true,
        featuredOrder: 11,
        categoryId: category.id,
      }
    });
    console.log(`Created product: ${product.name} in category: ${category.name}`);

    // Add the image
    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: "https://img.sanishtech.com/u/eb491f9f0cbbcc0bc1b52015382d0e3f.png",
        imageType: "MAIN",
        displayOrder: 0
      }
    });
    console.log("Added main image to product.");

    console.log("Success!");
  } catch (error) {
    console.error("Error adding product:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
