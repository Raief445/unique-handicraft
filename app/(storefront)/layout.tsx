import { EnquiryCartProvider } from "@/components/EnquiryCartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryCartDrawer from "@/components/EnquiryCartDrawer";
import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";

const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    });
  },
  ['layout-categories'],
  { revalidate: 600 }
);

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCachedCategories();

  return (
    <EnquiryCartProvider>
      <Navbar categories={categories} />
      <EnquiryCartDrawer />
      <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
        {children}
      </main>
      <Footer />
    </EnquiryCartProvider>
  );
}
