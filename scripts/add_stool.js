const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding new category 'Stools' and product...");

    // Check if category exists or create it
    let category = await prisma.category.findFirst({
      where: { name: "Stools" }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Stools",
          slug: "stools",
          description: "Premium handcrafted wooden stools for residential and commercial spaces.",
          status: "ACTIVE",
          displayOrder: 10,
        }
      });
      console.log("Created category: Stools");
    } else {
      console.log("Category 'Stools' already exists.");
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: "Classic Wooden Stool",
        productCode: "UT-STL-001",
        shortDescription: "An elegant, handcrafted solid wood stool featuring traditional Rajasthani craftsmanship.",
        description: "This premium wooden stool combines timeless design with robust construction. Crafted by master artisans in Jodhpur, it serves as a versatile seating option or an accent piece for any space. The rich wood grain and durable finish make it ideal for both residential and commercial hospitality settings.",
        material: "Solid Mango Wood",
        finish: "Natural Honey Finish",
        dimensionUnit: "INCH",
        length: 16,
        width: 16,
        height: 18,
        status: "PUBLISHED",
        featured: true,
        featuredOrder: 10,
        categoryId: category.id,
      }
    });
    console.log(`Created product: ${product.name}`);

    // Add the image
    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: "https://img.sanishtech.com/u/ef15550c65982fbcef8bb04703c2918f.png",
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
