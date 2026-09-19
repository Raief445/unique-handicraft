import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { EnquiryCartProvider } from "@/components/EnquiryCartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import VisitorTracker from "@/components/VisitorTracker";
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

export const metadata: Metadata = {
  title: "Unique Timber & Handicraft | Furniture & Handicrafts Jodhpur",
  description: "Jodhpur-based furniture and handicraft manufacturing since 2015, providing premium furniture and handicrafts.",
};

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCachedCategories();

  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body>
        <VisitorTracker />
        <AuthProvider>
          <EnquiryCartProvider>
            <Navbar categories={categories} />
            <EnquiryCartDrawer />
            <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
              {children}
            </main>
            <Footer />
          </EnquiryCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
